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
import { useAdminPaymentTotals } from "@/hooks/useAdminPaymentTotals";
import {
  PAYMENT_STATUS_BADGE_CLASSES,
  paymentStatusLabelKey,
} from "@/components/admin/admin-label-keys";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSortableHeader } from "@/components/admin/admin-sortable-header";
import { useAdminFilters } from "@/components/admin/use-admin-filters";
import {
  DEFAULT_ADMIN_PAYMENTS_FILTERS,
  type AdminPaymentsFilters,
  type AdminPaymentsSortColumn,
} from "@/queries/fetchAdminPayments";

const STATUS_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "PENDING", labelKey: "payment_status_pending" },
  { value: "PAID", labelKey: "payment_status_paid" },
  { value: "EXPIRED", labelKey: "payment_status_expired" },
] as const;

export function AdminCommissionsPanel() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { filters, setSearch, setPage, setFilterValue, toggleSort } =
    useAdminFilters<AdminPaymentsSortColumn, AdminPaymentsFilters>(
      DEFAULT_ADMIN_PAYMENTS_FILTERS,
    );
  const { data, isLoading, isError } = useAdminPayments(filters);
  const {
    data: totals,
    isLoading: totalsLoading,
    isError: totalsError,
  } = useAdminPaymentTotals();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
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

  //? Whole-dataset figures, deliberately independent of the table filters so
  //? they do not shift while the administrator pages or narrows the list.
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

  const payments = data?.rows ?? [];

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
              {totalsError
                ? t("error_load")
                : totalsLoading || card.value === null
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

      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <AdminTableToolbar
          filters={[
            {
              id: "admin-payments-status",
              labelKey: "commissions_col_status",
              value: filters.status,
              options: STATUS_OPTIONS,
              onChange: (value) => setFilterValue("status", value),
            },
          ]}
          onSearchChange={setSearch}
          resultCount={data?.total ?? null}
          search={filters.search}
          searchPlaceholderKey="commissions_search_placeholder"
        />

        {isError ? (
          <p className="text-sm text-neutral-500">{t("error_load")}</p>
        ) : isLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {data && data.total === 0 ? t("empty_filtered") : t("empty")}
          </p>
        ) : (
          <>
            <Table className="text-[#1a2b48]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <AdminSortableHeader
                    activeColumn={filters.sortColumn}
                    column="created_at"
                    direction={filters.sortDirection}
                    labelKey="commissions_col_date"
                    onSort={toggleSort}
                  />
                  <TableHead className="text-[#5b6b7c]">
                    {t("commissions_col_boat")}
                  </TableHead>
                  <AdminSortableHeader
                    activeColumn={filters.sortColumn}
                    column="status"
                    direction={filters.sortDirection}
                    labelKey="commissions_col_status"
                    onSort={toggleSort}
                  />
                  <AdminSortableHeader
                    activeColumn={filters.sortColumn}
                    align="right"
                    column="amount"
                    direction={filters.sortDirection}
                    labelKey="commissions_col_amount"
                    onSort={toggleSort}
                  />
                  <AdminSortableHeader
                    activeColumn={filters.sortColumn}
                    align="right"
                    column="commission_amount"
                    direction={filters.sortDirection}
                    labelKey="commissions_col_commission"
                    onSort={toggleSort}
                  />
                  <TableHead className="text-right text-[#5b6b7c]">
                    {t("commissions_col_owner")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
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

            <AdminPagination
              onPageChange={setPage}
              page={data?.page ?? 1}
              pageCount={data?.pageCount ?? 1}
            />
          </>
        )}
      </div>
    </div>
  );
}
