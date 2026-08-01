import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const PLATFORM_COMMISSION_RATE = 0.1;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CheckoutRequestBody = {
  boat_id?: string;
  start_date?: string;
  end_date?: string;
  locale?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function inclusiveDayCount(startDate: Date, endDate: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) + 1;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function toStripeCents(amount: number): number {
  return Math.round(amount * 100);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceRoleKey ||
    !stripeSecretKey
  ) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const authorizationHeader = request.headers.get("Authorization");
  if (!authorizationHeader) {
    return jsonResponse({ error: "Missing authorization" }, 401);
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const boatId = body.boat_id?.trim();
  const startDateValue = body.start_date?.trim();
  const endDateValue = body.end_date?.trim();
  const locale = body.locale === "fr" ? "fr" : "en";

  if (!boatId || !startDateValue || !endDateValue) {
    return jsonResponse(
      { error: "boat_id, start_date and end_date are required" },
      400,
    );
  }

  const startDate = parseIsoDate(startDateValue);
  const endDate = parseIsoDate(endDateValue);

  if (!startDate || !endDate || endDate < startDate) {
    return jsonResponse({ error: "Invalid date range" }, 400);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (startDate < today) {
    return jsonResponse({ error: "Start date must be today or later" }, 400);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorizationHeader } },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data: profile, error: profileError } = await adminClient
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return jsonResponse({ error: "User profile not found" }, 400);
  }

  const { data: boat, error: boatError } = await adminClient
    .from("boats")
    .select("id, name, price_per_day, is_published")
    .eq("id", boatId)
    .maybeSingle();

  if (boatError || !boat || !boat.is_published) {
    return jsonResponse({ error: "Boat not available" }, 404);
  }

  const { data: availabilitySlots, error: availabilityError } = await adminClient
    .from("boat_availability_time_slots")
    .select("id")
    .eq("boat_id", boatId)
    .lte("start_date", startDateValue)
    .gte("end_date", endDateValue)
    .limit(1);

  if (availabilityError) {
    return jsonResponse({ error: availabilityError.message }, 500);
  }

  if (!availabilitySlots || availabilitySlots.length === 0) {
    return jsonResponse({ error: "Dates unavailable" }, 409);
  }

  const dayCount = inclusiveDayCount(startDate, endDate);
  const ownerAmount = roundMoney(Number(boat.price_per_day) * dayCount);
  const commissionAmount = roundMoney(ownerAmount * PLATFORM_COMMISSION_RATE);
  const totalAmount = roundMoney(ownerAmount + commissionAmount);
  const currency = "eur";

  const { data: reservation, error: reservationError } = await adminClient
    .from("boat_reservations")
    .insert({
      renter_id: profile.id,
      boat_id: boatId,
      start_date: startDateValue,
      end_date: endDateValue,
      status: "PENDING",
      total_amount: totalAmount,
      currency: "EUR",
    })
    .select("id")
    .single();

  if (reservationError || !reservation) {
    const isOverlap =
      reservationError?.code === "23P01" ||
      reservationError?.message?.toLowerCase().includes("overlap") ||
      reservationError?.message?.toLowerCase().includes("exclusion");

    return jsonResponse(
      {
        error: isOverlap
          ? "Dates unavailable"
          : (reservationError?.message ?? "Failed to create reservation"),
      },
      isOverlap ? 409 : 500,
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    // deno-lint-ignore no-explicit-any
    apiVersion: "2024-06-20" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  let checkoutSession: Stripe.Checkout.Session;

  try {
    checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: profile.email ?? user.email ?? undefined,
      success_url: `${siteUrl}/${locale}/bookings?checkout=success`,
      cancel_url: `${siteUrl}/${locale}/bookings?checkout=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toStripeCents(ownerAmount),
            product_data: {
              name: `Rental — ${boat.name}`,
              description: `${startDateValue} → ${endDateValue} (${dayCount} day(s))`,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toStripeCents(commissionAmount),
            product_data: {
              name: "Service fee (10%)",
              description: "SailingLoc platform commission",
            },
          },
        },
      ],
      metadata: {
        reservation_id: reservation.id,
        boat_id: boatId,
        renter_id: profile.id,
      },
    });
  } catch (stripeError) {
    await adminClient.from("boat_reservations").delete().eq("id", reservation.id);

    const message =
      stripeError instanceof Error ? stripeError.message : "Stripe error";
    return jsonResponse({ error: message }, 502);
  }

  if (!checkoutSession.url) {
    await adminClient.from("boat_reservations").delete().eq("id", reservation.id);
    return jsonResponse({ error: "Checkout session missing URL" }, 502);
  }

  const { error: paymentError } = await adminClient
    .from("payment_transactions")
    .insert({
      reservation_id: reservation.id,
      provider: "STRIPE",
      external_id: checkoutSession.id,
      amount: totalAmount,
      commission_amount: commissionAmount,
      owner_amount: ownerAmount,
      status: "PENDING",
    });

  if (paymentError) {
    await adminClient.from("boat_reservations").delete().eq("id", reservation.id);
    return jsonResponse({ error: paymentError.message }, 500);
  }

  return jsonResponse({
    checkout_url: checkoutSession.url,
    reservation_id: reservation.id,
  });
});
