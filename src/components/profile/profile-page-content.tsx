"use client";

import { useForm } from "@tanstack/react-form";
import { format, parseISO } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useMyReservations } from "@/hooks/useBoatReservations";
import { useMyReviews } from "@/hooks/useMyReviews";
import { useUpdateCurrentUser } from "@/hooks/useProfileMutations";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ReservationChatDialog } from "@/components/profile/reservation-chat-dialog";
import {
  getReservationReview,
  reservationHasReview,
} from "@/queries/fetchBoatReservations";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

export function ProfilePageContent() {
  const t = useTranslations("Pages.ProfilePage");
  const tLanding = useTranslations("Pages.LandingPage");
  const tBookings = useTranslations("Pages.BookingsPage");
  const locale = useLocale();
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser();
  const { data: roleRow } = useCurrentUserRole();
  const updateProfile = useUpdateCurrentUser();
  const {
    data: reservations = [],
    isLoading: reservationsLoading,
  } = useMyReservations();
  const { data: reviews = [], isLoading: reviewsLoading } = useMyReviews();

  const dateFnsLocale =
    DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] ?? enUS;

  const pastReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === "COMPLETED"),
    [reservations],
  );

  const upcomingReservations = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    return reservations
      .filter(
        (reservation) =>
          (reservation.status === "CONFIRMED" ||
            reservation.status === "PENDING") &&
          reservation.end_date >= today,
      )
      .sort((left, right) => left.start_date.localeCompare(right.start_date));
  }, [reservations]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const profileSchema = z.object({
    firstName: z.string().trim().min(1, t("validation_first_name")),
    lastName: z.string().trim().min(1, t("validation_last_name")),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^\+?[0-9\s.-]{8,20}$/.test(value),
        t("validation_phone"),
      ),
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
    onSubmit: async ({ value }) => {
      const validated = profileSchema.parse(value);

      try {
        await updateProfile.mutateAsync({
          firstName: validated.firstName,
          lastName: validated.lastName,
          phone: validated.phone.length > 0 ? validated.phone : null,
        });
        toast.success(t("save_success"));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("save_error"),
        );
      }
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.setFieldValue("firstName", user.first_name ?? "");
    form.setFieldValue("lastName", user.last_name ?? "");
    form.setFieldValue("phone", user.phone ?? "");
  }, [user, form]);

  const role = roleRow?.role ?? null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1a2b48]">{t("title")}</h1>
        <p className="text-sm text-neutral-500">{t("subtitle")}</p>
      </div>

      {userLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : null}

      {userError ? (
        <p className="text-sm text-red-600">{t("error")}</p>
      ) : null}

      {!userLoading && !userError && user ? (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1a2b48]">
            {t("personal_info_heading")}
          </h2>
          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="firstName"
                validators={{
                  onChange: ({ value }) => {
                    const result = profileSchema.shape.firstName.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>{t("first_name_label")}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                    {field.state.meta.errors[0] ? (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onChange: ({ value }) => {
                    const result = profileSchema.shape.lastName.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>{t("last_name_label")}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                    {field.state.meta.errors[0] ? (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">{t("email_label")}</Label>
              <Input
                disabled
                id="profile-email"
                readOnly
                value={user.email ?? ""}
              />
              <p className="text-xs text-neutral-400">{t("email_readonly_hint")}</p>
            </div>

            <form.Field
              name="phone"
              validators={{
                onChange: ({ value }) => {
                  const result = profileSchema.shape.phone.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>{t("phone_label")}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("phone_placeholder")}
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
                disabled={updateProfile.isPending}
                type="submit"
              >
                {updateProfile.isPending ? t("saving") : t("save")}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/bookings">{t("view_bookings")}</Link>
              </Button>
              {role === "RENTER" ? (
                <Button asChild type="button" variant="ghost">
                  <Link href="/become-owner">{t("become_owner")}</Link>
                </Button>
              ) : null}
              {role === "OWNER" || role === "ADMINISTRATOR" ? (
                <Button asChild type="button" variant="ghost">
                  <Link href="/owner">{t("owner_space")}</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1a2b48]">
            {t("upcoming_bookings_heading")}
          </h2>
          <p className="text-sm text-neutral-500">
            {t("upcoming_bookings_subtitle")}
          </p>
        </div>

        {reservationsLoading ? (
          <p className="text-sm text-neutral-500">
            {t("upcoming_bookings_loading")}
          </p>
        ) : null}

        {!reservationsLoading && upcomingReservations.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            {t("upcoming_bookings_empty")}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {upcomingReservations.map((reservation) => {
            const boat = reservation.boats;
            const boatName = boat?.name ?? t("unknown_boat");
            const portName = boat?.ports?.name ?? "—";
            const typeLabel = boat
              ? tLanding(`search_type_${boat.type.toLowerCase()}`)
              : null;
            const statusLabel =
              reservation.status === "CONFIRMED"
                ? tBookings("status_confirmed")
                : tBookings("status_pending");

            return (
              <article
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                key={reservation.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#1a2b48]">
                        {boatName}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          reservation.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        {statusLabel}
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
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ReservationChatDialog
                      boatName={boatName}
                      reservationId={reservation.id}
                    />
                    {boat ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/boats/${boat.id}`}>{t("view_boat")}</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#1a2b48]">
              {t("past_bookings_heading")}
            </h2>
            <p className="text-sm text-neutral-500">
              {t("past_bookings_subtitle")}
            </p>
          </div>
          {averageRating != null ? (
            <p className="flex items-center gap-1 text-sm font-medium text-[#1a2b48]">
              <Star
                aria-hidden
                className="size-3.5 fill-[#c9866a] text-[#c9866a]"
              />
              {t("average_rating", {
                rating: averageRating.toLocaleString(locale),
                count: reviews.length,
              })}
            </p>
          ) : null}
        </div>

        {reservationsLoading ? (
          <p className="text-sm text-neutral-500">{t("past_bookings_loading")}</p>
        ) : null}

        {!reservationsLoading && pastReservations.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            {t("past_bookings_empty")}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {pastReservations.map((reservation) => {
            const boat = reservation.boats;
            const boatName = boat?.name ?? t("unknown_boat");
            const portName = boat?.ports?.name ?? "—";
            const typeLabel = boat
              ? tLanding(`search_type_${boat.type.toLowerCase()}`)
              : null;
            const review = getReservationReview(reservation.boat_reviews);
            const hasReview = reservationHasReview(reservation.boat_reviews);

            return (
              <article
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                key={reservation.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[#1a2b48]">{boatName}</h3>
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
                    {review ? (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-0.5 text-[#c9866a]">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              className={cn(
                                "size-3.5",
                                index < Math.round(review.rating)
                                  ? "fill-current"
                                  : "fill-none",
                              )}
                              key={index}
                            />
                          ))}
                          <span className="ml-1 text-xs font-medium text-[#1a2b48]">
                            {Number(review.rating).toLocaleString(locale)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-amber-700">
                        {t("past_booking_no_review")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {boat ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/boats/${boat.id}`}>{t("view_boat")}</Link>
                      </Button>
                    ) : null}
                    {!hasReview ? (
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/bookings">{t("leave_review_cta")}</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1a2b48]">
            {t("reviews_heading")}
          </h2>
          <p className="text-sm text-neutral-500">{t("reviews_subtitle")}</p>
        </div>

        {reviewsLoading ? (
          <p className="text-sm text-neutral-500">{t("reviews_loading")}</p>
        ) : null}

        {!reviewsLoading && reviews.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            {t("reviews_empty")}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const boat = review.boats;
            const boatName = boat?.name ?? t("unknown_boat");
            const portName = boat?.ports?.name ?? "—";

            return (
              <article
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                key={review.id}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#1a2b48]">{boatName}</h3>
                    <div className="flex items-center gap-0.5 text-[#c9866a]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          className={cn(
                            "size-3.5",
                            index < Math.round(review.rating)
                              ? "fill-current"
                              : "fill-none",
                          )}
                          key={index}
                        />
                      ))}
                      <span className="ml-1 text-xs font-medium text-[#1a2b48]">
                        {Number(review.rating).toLocaleString(locale)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500">{portName}</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400">
                    {format(parseISO(review.created_at), "dd MMM yyyy", {
                      locale: dateFnsLocale,
                    })}
                  </p>
                  {boat ? (
                    <div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/boats/${boat.id}`}>{t("view_boat")}</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
