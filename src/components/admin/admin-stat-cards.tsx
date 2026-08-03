"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, Ship, Users, Wallet } from "lucide-react";
import { useAdminPlatformStats } from "@/hooks/useAdminPlatformStats";

export function AdminStatCards() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data, isLoading, isError } = useAdminPlatformStats();

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const cards = [
    {
      labelKey: "stat_users",
      icon: Users,
      value: data ? numberFormatter.format(data.totalUsers) : null,
    },
    {
      labelKey: "stat_published_boats",
      icon: Ship,
      value: data ? numberFormatter.format(data.publishedBoats) : null,
    },
    {
      labelKey: "stat_reservations_month",
      icon: CalendarCheck,
      value: data ? numberFormatter.format(data.reservationsThisMonth) : null,
    },
    {
      labelKey: "stat_commission_month",
      icon: Wallet,
      value: data ? currencyFormatter.format(data.commissionThisMonth) : null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.labelKey}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-[#5b6b7c] uppercase">
                {t(card.labelKey)}
              </p>
              <Icon aria-hidden className="size-4 text-[#D68A6E]" />
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1a2b48]">
              {isError
                ? t("error_load")
                : isLoading || card.value === null
                  ? t("loading")
                  : card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
