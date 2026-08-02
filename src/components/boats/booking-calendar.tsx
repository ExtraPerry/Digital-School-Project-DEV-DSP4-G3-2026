"use client";

import { useMemo, useState } from "react";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Lock, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { DateRange, Matcher } from "react-day-picker";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { useBoatAvailabilitySlots } from "@/hooks/useBoatAvailabilitySlots";
import { useBoatActiveReservations } from "@/hooks/useBoatReservations";
import { useCreateBookingCheckout } from "@/hooks/useBookingMutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "@/i18n/navigation";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

function parseDateOnly(value: string): Date {
  return startOfDay(parseISO(value));
}

export function BookingCalendar({
  boatId,
  depositAmount,
  locale,
  pricePerDay,
}: {
  boatId: string;
  depositAmount: number;
  locale: string;
  pricePerDay: number;
}) {
  const t = useTranslations("Pages.BoatPage");
  const activeLocale = useLocale();
  const router = useRouter();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: availabilitySlots = [] } = useBoatAvailabilitySlots(boatId);
  const { data: activeReservations = [] } =
    useBoatActiveReservations(boatId);
  const createBookingCheckout = useCreateBookingCheckout();

  const [range, setRange] = useState<DateRange | undefined>();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const dateFnsLocale =
    DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] ?? enUS;

  const bookedDates = useMemo(() => {
    const dates: Date[] = [];

    for (const reservation of activeReservations) {
      const start = parseDateOnly(reservation.start_date);
      const end = parseDateOnly(reservation.end_date);
      dates.push(...eachDayOfInterval({ start, end }));
    }

    return dates;
  }, [activeReservations]);

  const isDateAvailable = useMemo(() => {
    return (date: Date) => {
      const day = startOfDay(date);

      if (availabilitySlots.length === 0) {
        return false;
      }

      const coveredBySlot = availabilitySlots.some((slot) => {
        const slotStart = parseDateOnly(slot.start_date);
        const slotEnd = parseDateOnly(slot.end_date);
        return isWithinInterval(day, { start: slotStart, end: slotEnd });
      });

      if (!coveredBySlot) {
        return false;
      }

      return !bookedDates.some(
        (bookedDate) => bookedDate.getTime() === day.getTime(),
      );
    };
  }, [availabilitySlots, bookedDates]);

  const disabledMatchers: Matcher[] = useMemo(
    () => [{ before: startOfDay(new Date()) }, (date) => !isDateAvailable(date)],
    [isDateAvailable],
  );

  const from = range?.from;
  const to = range?.to;
  const hasCompleteRange = !!from && !!to && to.getTime() >= from.getTime();
  const days =
    from && to && hasCompleteRange
      ? differenceInCalendarDays(to, from) + 1
      : 0;
  const subtotal = pricePerDay * days;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const isRangeBookable =
    hasCompleteRange &&
    from &&
    to &&
    eachDayOfInterval({ start: from, end: to }).every(isDateAvailable);

  async function handleBook() {
    if (!from || !to || !hasCompleteRange) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!isRangeBookable) {
      toast.error(t("booking_error_unavailable"));
      return;
    }

    try {
      const result = await createBookingCheckout.mutateAsync({
        boatId,
        startDate: from,
        endDate: to,
        locale: activeLocale,
      });

      window.location.assign(result.checkout_url!);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("booking_error_generic");
      const isUnavailable = message.toLowerCase().includes("unavailable");
      toast.error(
        isUnavailable
          ? t("booking_error_unavailable")
          : message || t("booking_error_generic"),
      );
    }
  }

  const isSubmitting = createBookingCheckout.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 rounded-xl border border-neutral-200">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {t("booking_from_label")}
          </span>
          <span className="text-sm font-semibold text-[#1a2b48]">
            {range?.from ? format(range.from, "dd/MM/yyyy") : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-neutral-200 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {t("booking_to_label")}
          </span>
          <span className="text-sm font-semibold text-[#1a2b48]">
            {range?.to ? format(range.to, "dd/MM/yyyy") : "—"}
          </span>
        </div>
      </div>

      <Calendar
        className="mx-auto [--accent:#1a2b48] [--accent-foreground:#ffffff] [--background:#ffffff] [--cell-size:--spacing(8)] [--foreground:#1a2b48] [--muted-foreground:#64748b] [--muted:#eef1f6] [--popover-foreground:#1a2b48] [--popover:#ffffff] [--primary-foreground:#ffffff] [--primary:#D68A6E] [--ring:#1a2b48]"
        disabled={disabledMatchers}
        locale={dateFnsLocale}
        mode="range"
        onSelect={setRange}
        selected={range}
      />

      {from && !hasCompleteRange ? (
        <p className="text-center text-xs text-neutral-500">
          {t("booking_select_end_date")}
        </p>
      ) : null}

      {days > 0 ? (
        <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">
              {t("booking_subtotal_label", {
                price: priceFormatter.format(pricePerDay),
                days,
              })}
            </span>
            <span className="font-medium text-[#1a2b48]">
              {priceFormatter.format(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">
              {t("booking_service_fee_label")}
            </span>
            <span className="font-medium text-[#1a2b48]">
              + {priceFormatter.format(serviceFee)}
            </span>
          </div>
          {depositAmount > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                {t("booking_deposit_label")}
              </span>
              <span className="font-medium text-[#1a2b48]">
                {priceFormatter.format(depositAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-base">
            <span className="font-semibold text-[#1a2b48]">
              {t("booking_total_label")}
            </span>
            <span className="font-bold text-[#1a2b48]">
              {priceFormatter.format(total)}
            </span>
          </div>
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#D68A6E] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c57d5f] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={
          !hasCompleteRange ||
          !isRangeBookable ||
          isSubmitting ||
          isUserLoading
        }
        onClick={() => {
          void handleBook();
        }}
        type="button"
      >
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t("booking_cta_loading")}
          </>
        ) : currentUser ? (
          t("booking_cta")
        ) : (
          t("booking_cta_login")
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
        <Lock aria-hidden className="size-3" />
        {t("booking_payment_note")}
      </p>
    </div>
  );
}
