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
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSortableHeader } from "@/components/admin/admin-sortable-header";
import { useAdminFilters } from "@/components/admin/use-admin-filters";
import {
  DEFAULT_ADMIN_RESERVATIONS_FILTERS,
  type AdminReservationsFilters,
  type AdminReservationsSortColumn,
} from "@/queries/fetchAdminReservations";

const STATUS_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "PENDING", labelKey: "reservation_status_pending" },
  { value: "CONFIRMED", labelKey: "reservation_status_confirmed" },
  { value: "COMPLETED", labelKey: "reservation_status_completed" },
  { value: "CANCELLED", labelKey: "reservation_status_cancelled" },
] as const;

export function AdminReservationsTable() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { filters, setSearch, setPage, setFilterValue, toggleSort } =
    useAdminFilters<AdminReservationsSortColumn, AdminReservationsFilters>(
      DEFAULT_ADMIN_RESERVATIONS_FILTERS,
    );
  const { data, isLoading, isError } = useAdminReservations(filters);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
    [locale],
  );

  const reservations = data?.rows ?? [];

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-lg bg-[#eef1f6] px-4 py-3 text-xs text-[#5b6b7c]">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("reservations_readonly_note")}
      </p>

      <AdminTableToolbar
        filters={[
          {
            id: "admin-reservations-status",
            labelKey: "reservations_col_status",
            value: filters.status,
            options: STATUS_OPTIONS,
            onChange: (value) => setFilterValue("status", value),
          },
        ]}
        onSearchChange={setSearch}
        resultCount={data?.total ?? null}
        search={filters.search}
        searchPlaceholderKey="reservations_search_placeholder"
      />

      {isError ? (
        <p className="text-sm text-neutral-500">{t("error_load")}</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {data && data.total === 0 ? t("empty_filtered") : t("empty")}
        </p>
      ) : (
        <>
          <Table className="text-[#1a2b48]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#5b6b7c]">
                  {t("reservations_col_boat")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("reservations_col_renter")}
                </TableHead>
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="start_date"
                  direction={filters.sortDirection}
                  labelKey="reservations_col_dates"
                  onSort={toggleSort}
                />
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="status"
                  direction={filters.sortDirection}
                  labelKey="reservations_col_status"
                  onSort={toggleSort}
                />
                <TableHead className="text-[#5b6b7c]">
                  {t("reservations_col_payment")}
                </TableHead>
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  align="right"
                  column="total_amount"
                  direction={filters.sortDirection}
                  labelKey="reservations_col_total"
                  onSort={toggleSort}
                />
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
                      : currencyFormatter.format(
                          Number(reservation.total_amount),
                        )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            onPageChange={setPage}
            page={data?.page ?? 1}
            pageCount={data?.pageCount ?? 1}
          />
        </>
      )}
    </div>
  );
}
