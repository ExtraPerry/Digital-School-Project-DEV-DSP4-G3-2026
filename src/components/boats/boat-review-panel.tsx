"use client";

import { useTranslations } from "next-intl";
import { LeaveReviewDialog } from "@/components/boats/leave-review-dialog";
import { useMyReservations } from "@/hooks/useBoatReservations";
import { Link, useRouter } from "@/i18n/navigation";
import { reservationHasReview } from "@/queries/fetchBoatReservations";

/**
 * Entry point for posting a review from the boat page.
 *
 * Reviews are post-rental by design: `boat_reviews` only accepts a row that
 * points at a COMPLETED reservation of the caller's own, and only one per
 * rental. The panel therefore does not merely show or hide a button — it says
 * which of those conditions is not met yet, so a visitor is never left guessing
 * why they cannot write anything.
 */
export function BoatReviewPanel({
  boatId,
  boatName,
  isAuthenticated,
}: {
  boatId: string;
  boatName: string;
  /**
   * Read from the session by the page rather than by a client query: on a
   * public page the current-user query rejects for a visitor and only settles
   * after its retries, which would leave this panel blank for seconds.
   */
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Pages.BoatPage");
  const router = useRouter();
  const { data: reservations = [], isPending: areReservationsPending } =
    useMyReservations();

  if (!isAuthenticated) {
    return (
      <ReviewNotice>
        {t("review_signed_out")}{" "}
        <Link
          className="font-medium text-[#1a2b48] underline underline-offset-2 hover:text-[#D68A6E]"
          href="/login"
        >
          {t("review_sign_in")}
        </Link>
      </ReviewNotice>
    );
  }

  if (areReservationsPending) {
    return null;
  }

  const boatReservations = reservations.filter(
    (reservation) => reservation.boat_id === boatId,
  );
  const reviewableReservation = boatReservations.find(
    (reservation) =>
      reservation.status === "COMPLETED" &&
      !reservationHasReview(reservation.boat_reviews),
  );

  if (reviewableReservation) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
        <p className="text-sm text-neutral-500">{t("review_invitation")}</p>
        <LeaveReviewDialog
          boatId={boatId}
          boatName={boatName}
          //? The page prints the reviews server-side, so the new one only
          //? appears once that render is replayed.
          onSuccess={() => router.refresh()}
          reservationId={reviewableReservation.id}
        />
      </div>
    );
  }

  if (
    boatReservations.some((reservation) =>
      reservationHasReview(reservation.boat_reviews),
    )
  ) {
    return <ReviewNotice>{t("review_already_left")}</ReviewNotice>;
  }

  if (
    boatReservations.some(
      (reservation) =>
        reservation.status === "PENDING" || reservation.status === "CONFIRMED",
    )
  ) {
    return <ReviewNotice>{t("review_after_rental")}</ReviewNotice>;
  }

  return <ReviewNotice>{t("review_requires_rental")}</ReviewNotice>;
}

function ReviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-neutral-200 pt-5 text-sm text-neutral-500">
      {children}
    </p>
  );
}
