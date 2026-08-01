"use client";

import { format, parseISO } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { LeaveReviewDialog } from "@/components/bookings/leave-review-dialog";
import { useMyReservations } from "@/hooks/useBoatReservations";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";
import { reservationHasReview } from "@/queries/fetchBoatReservations";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-neutral-100 text-neutral-600",
  COMPLETED: "bg-sky-100 text-sky-800",
};

function getPaymentStatusLabel(
  t: (key: "payment_pending" | "payment_paid" | "payment_expired") => string,
  status: string,
): string {
  switch (status.toUpperCase()) {
    case "PENDING":
      return t("payment_pending");
    case "PAID":
      return t("payment_paid");
    case "EXPIRED":
      return t("payment_expired");
    default:
      return status;
  }
}

export function BookingsPageContent() {
  const t = useTranslations("Pages.BookingsPage");
  const tLanding = useTranslations("Pages.LandingPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");
  const { data: reservations = [], isLoading, isError } = useMyReservations();

  const dateFnsLocale =
    DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] ?? enUS;

  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1a2b48]">{t("title")}</h1>
        <p className="text-sm text-neutral-500">{t("subtitle")}</p>
      </div>

      {checkoutResult === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t("checkout_success")}
        </div>
      ) : null}

      {checkoutResult === "cancelled" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("checkout_cancelled")}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600">{t("error")}</p>
      ) : null}

      {!isLoading && !isError && reservations.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-neutral-600">{t("empty")}</p>
          <Link
            className="inline-flex rounded-md bg-[#D68A6E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#c57d5f]"
            href="/search"
          >
            {t("empty_cta")}
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {reservations.map((reservation) => {
          const boat = reservation.boats;
          const boatName = boat?.name ?? t("unknown_boat");
          const portName = boat?.ports?.name ?? "—";
          const typeLabel = boat
            ? tLanding(`search_type_${boat.type.toLowerCase()}`)
            : null;
          const hasReview = reservationHasReview(reservation.boat_reviews);
          const canReview =
            reservation.status === "COMPLETED" && !hasReview && boat;

          return (
            <article
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              key={reservation.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#1a2b48]">
                      {boatName}
                    </h2>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[reservation.status],
                      )}
                    >
                      {t(`status_${reservation.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {[typeLabel, portName].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-[#1a2b48]">
                    {format(parseISO(reservation.start_date), "dd MMM yyyy", {
                      locale: dateFnsLocale,
                    })}
                    {" → "}
                    {format(parseISO(reservation.end_date), "dd MMM yyyy", {
                      locale: dateFnsLocale,
                    })}
                  </p>
                  {reservation.total_amount != null ? (
                    <p className="text-sm font-medium text-[#1a2b48]">
                      {t("total_label", {
                        amount: priceFormatter.format(
                          Number(reservation.total_amount),
                        ),
                      })}
                    </p>
                  ) : null}
                  {reservation.payment_transactions ? (
                    <p className="text-xs text-neutral-400">
                      {t("payment_status", {
                        status: getPaymentStatusLabel(
                          t,
                          reservation.payment_transactions.status,
                        ),
                      })}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {boat ? (
                    <Link
                      className="inline-flex rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-[#1a2b48] hover:bg-neutral-50"
                      href={`/boats/${boat.id}`}
                    >
                      {t("view_boat")}
                    </Link>
                  ) : null}
                  {canReview ? (
                    <LeaveReviewDialog
                      boatId={boat.id}
                      boatName={boatName}
                      reservationId={reservation.id}
                    />
                  ) : null}
                  {hasReview ? (
                    <span className="text-xs font-medium text-emerald-700">
                      {t("review_done")}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
