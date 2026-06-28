"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function BookingCalendar({
  depositAmount,
  locale,
  pricePerDay,
}: {
  depositAmount: number;
  locale: string;
  pricePerDay: number;
}) {
  const t = useTranslations("Pages.BoatPage");
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: inDays(3),
  });

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

  const from = range?.from;
  const to = range?.to;
  const hasCompleteRange = !!from && !!to && to.getTime() > from.getTime();
  const days =
    from && to && hasCompleteRange
      ? differenceInCalendarDays(to, from) + 1
      : 0;
  const subtotal = pricePerDay * days;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

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
        disabled={{ before: new Date() }}
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
        className="w-full rounded-md bg-[#D68A6E] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c57d5f] disabled:cursor-not-allowed disabled:opacity-60"
        disabled
        type="button"
      >
        {t("booking_cta")}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
        <Lock aria-hidden className="size-3" />
        {t("booking_payment_note")}
      </p>
    </div>
  );
}
