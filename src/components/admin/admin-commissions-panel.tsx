"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminPayments } from "@/hooks/useAdminPayments";
import {
  PAYMENT_STATUS_BADGE_CLASSES,
  paymentStatusLabelKey,
} from "@/components/admin/admin-label-keys";

export function AdminCommissionsPanel() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data, isLoading, isError } = useAdminPayments();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
    [locale],
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const totals = data?.totals;
  const summary = [
    {
      labelKey: "commissions_gross",
      value: totals ? currencyFormatter.format(totals.grossVolume) : null,
    },
    {
      labelKey: "commissions_platform",
      value: totals ? currencyFormatter.format(totals.platformCommission) : null,
    },
    {
      labelKey: "commissions_owner_payable",
      value: totals ? currencyFormatter.format(totals.ownerPayable) : null,
    },
    {
      labelKey: "commissions_paid_count",
      value: totals ? numberFormatter.format(totals.paidCount) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((card) => (
          <div
            key={card.labelKey}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium tracking-wide text-[#5b6b7c] uppercase">
              {t(card.labelKey)}
            </p>
            <p className="mt-3 text-2xl font-bold text-[#1a2b48]">
              {isError
                ? t("error_load")
                : isLoading || card.value === null
                  ? t("loading")
                  : card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-[#eef1f6] px-4 py-3 text-xs text-[#5b6b7c]">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("commissions_note")}
      </p>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        {isError ? (
          <p className="text-sm text-neutral-500">{t("error_load")}</p>
        ) : isLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : !data || data.payments.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <Table className="text-[#1a2b48]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#5b6b7c]">
                  {t("commissions_col_date")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("commissions_col_boat")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("commissions_col_status")}
                </TableHead>
                <TableHead className="text-right text-[#5b6b7c]">
                  {t("commissions_col_amount")}
                </TableHead>
                <TableHead className="text-right text-[#5b6b7c]">
                  {t("commissions_col_commission")}
                </TableHead>
                <TableHead className="text-right text-[#5b6b7c]">
                  {t("commissions_col_owner")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-[#f4f6f9]">
                  <TableCell className="text-[#1a2b48]">
                    {dateFormatter.format(new Date(payment.created_at))}
                  </TableCell>
                  <TableCell className="font-medium text-[#1a2b48]">
                    {payment.boatName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        PAYMENT_STATUS_BADGE_CLASSES[payment.status] ||
                        "bg-neutral-200 text-neutral-700 hover:bg-neutral-200"
                      }
                    >
                      {t(paymentStatusLabelKey(payment.status))}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[#1a2b48]">
                    {currencyFormatter.format(Number(payment.amount))}
                  </TableCell>
                  <TableCell className="text-right text-[#1a2b48]">
                    {payment.commission_amount === null
                      ? "—"
                      : currencyFormatter.format(
                          Number(payment.commission_amount),
                        )}
                  </TableCell>
                  <TableCell className="text-right text-[#1a2b48]">
                    {payment.owner_amount === null
                      ? "—"
                      : currencyFormatter.format(Number(payment.owner_amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
