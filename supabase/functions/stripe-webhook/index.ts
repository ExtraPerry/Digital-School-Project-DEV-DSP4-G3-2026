import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !stripeSecretKey ||
    !stripeWebhookSecret
  ) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeSecretKey, {
    // deno-lint-ignore no-explicit-any
    apiVersion: "2024-06-20" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    return new Response(message, { status: 400 });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;

    if (!reservationId) {
      return new Response("Missing reservation_id metadata", { status: 400 });
    }

    const { error: reservationError } = await adminClient
      .from("boat_reservations")
      .update({ status: "CONFIRMED" })
      .eq("id", reservationId)
      .eq("status", "PENDING");

    if (reservationError) {
      return new Response(reservationError.message, { status: 500 });
    }

    const { error: paymentError } = await adminClient
      .from("payment_transactions")
      .update({
        status: "PAID",
        external_id: session.id,
      })
      .eq("reservation_id", reservationId);

    if (paymentError) {
      return new Response(paymentError.message, { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;

    if (!reservationId) {
      return new Response("Missing reservation_id metadata", { status: 400 });
    }

    const { error: reservationError } = await adminClient
      .from("boat_reservations")
      .update({ status: "CANCELLED" })
      .eq("id", reservationId)
      .eq("status", "PENDING");

    if (reservationError) {
      return new Response(reservationError.message, { status: 500 });
    }

    const { error: paymentError } = await adminClient
      .from("payment_transactions")
      .update({
        status: "EXPIRED",
        external_id: session.id,
      })
      .eq("reservation_id", reservationId)
      .eq("status", "PENDING");

    if (paymentError) {
      return new Response(paymentError.message, { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
