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
import { useAdminReservations } from "@/hooks/useAdminReservations";
import {
  PAYMENT_STATUS_BADGE_CLASSES,
  RESERVATION_STATUS_BADGE_CLASSES,
  RESERVATION_STATUS_LABEL_KEYS,
  paymentStatusLabelKey,
} from "@/components/admin/admin-label-keys";

export function AdminReservationsTable() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data: reservations = [], isLoading, isError } = useAdminReservations();

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
    [locale],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-lg bg-[#eef1f6] px-4 py-3 text-xs text-[#5b6b7c]">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("reservations_readonly_note")}
      </p>

      {isError ? (
        <p className="text-sm text-neutral-500">{t("error_load")}</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("empty")}</p>
      ) : (
        <Table className="text-[#1a2b48]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[#5b6b7c]">
                {t("reservations_col_boat")}
              </TableHead>
              <TableHead className="text-[#5b6b7c]">
                {t("reservations_col_renter")}
              </TableHead>
              <TableHead className="text-[#5b6b7c]">
                {t("reservations_col_dates")}
              </TableHead>
              <TableHead className="text-[#5b6b7c]">
                {t("reservations_col_status")}
              </TableHead>
              <TableHead className="text-[#5b6b7c]">
                {t("reservations_col_payment")}
              </TableHead>
              <TableHead className="text-right text-[#5b6b7c]">
                {t("reservations_col_total")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} className="hover:bg-[#f4f6f9]">
                <TableCell className="font-medium text-[#1a2b48]">
                  {reservation.boatName ?? "—"}
                </TableCell>
                <TableCell>
                  <span className="block text-[#1a2b48]">
                    {reservation.renterName ?? "—"}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {reservation.renterEmail ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-[#1a2b48]">
                  {dateFormatter.format(new Date(reservation.start_date))} →{" "}
                  {dateFormatter.format(new Date(reservation.end_date))}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      RESERVATION_STATUS_BADGE_CLASSES[reservation.status]
                    }
                  >
                    {t(RESERVATION_STATUS_LABEL_KEYS[reservation.status])}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      (reservation.paymentStatus &&
                        PAYMENT_STATUS_BADGE_CLASSES[
                          reservation.paymentStatus
                        ]) ||
                      "bg-neutral-200 text-neutral-700 hover:bg-neutral-200"
                    }
                  >
                    {t(paymentStatusLabelKey(reservation.paymentStatus))}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-[#1a2b48]">
                  {reservation.total_amount === null
                    ? "—"
                    : currencyFormatter.format(Number(reservation.total_amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
