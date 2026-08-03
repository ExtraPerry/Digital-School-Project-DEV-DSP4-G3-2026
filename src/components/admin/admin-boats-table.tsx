"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBoats } from "@/hooks/useAdminBoats";
import {
  mapAdminMutationError,
  useAdminSetBoatPublished,
} from "@/hooks/useAdminMutations";
import { BOAT_TYPE_LABEL_KEYS } from "@/components/admin/admin-label-keys";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSortableHeader } from "@/components/admin/admin-sortable-header";
import { useAdminFilters } from "@/components/admin/use-admin-filters";
import {
  DEFAULT_ADMIN_BOATS_FILTERS,
  type AdminBoatsFilters,
  type AdminBoatsSortColumn,
} from "@/queries/fetchAdminBoats";

const TYPE_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "SAILBOAT", labelKey: "type_sailboat" },
  { value: "MOTORBOAT", labelKey: "type_motorboat" },
  { value: "CATAMARAN", labelKey: "type_catamaran" },
  { value: "YACHT", labelKey: "type_yacht" },
] as const;

const PUBLISHED_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "PUBLISHED", labelKey: "status_published" },
  { value: "DRAFT", labelKey: "status_draft" },
] as const;

export function AdminBoatsTable() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { filters, setSearch, setPage, setFilterValue, toggleSort } =
    useAdminFilters<AdminBoatsSortColumn, AdminBoatsFilters>(
      DEFAULT_ADMIN_BOATS_FILTERS,
    );
  const { data, isLoading, isError } = useAdminBoats(filters);
  const setPublished = useAdminSetBoatPublished();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  async function togglePublished(boatId: string, isPublished: boolean) {
    try {
      await setPublished.mutateAsync({ boatId, isPublished: !isPublished });
      toast.success(
        isPublished ? t("toast_boat_unpublished") : t("toast_boat_published"),
      );
    } catch (error) {
      toast.error(
        t(mapAdminMutationError(error instanceof Error ? error.message : "")),
      );
    }
  }

  const boats = data?.rows ?? [];

  return (
    <div className="flex flex-col gap-4">
      <AdminTableToolbar
        filters={[
          {
            id: "admin-boats-type",
            labelKey: "boats_col_type",
            value: filters.type,
            options: TYPE_OPTIONS,
            onChange: (value) => setFilterValue("type", value),
          },
          {
            id: "admin-boats-published",
            labelKey: "boats_col_status",
            value: filters.published,
            options: PUBLISHED_OPTIONS,
            onChange: (value) => setFilterValue("published", value),
          },
        ]}
        onSearchChange={setSearch}
        resultCount={data?.total ?? null}
        search={filters.search}
        searchPlaceholderKey="boats_search_placeholder"
      />

      {isError ? (
        <p className="text-sm text-neutral-500">{t("error_load")}</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : boats.length === 0 ? (
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
                  column="name"
                  direction={filters.sortDirection}
                  labelKey="boats_col_boat"
                  onSort={toggleSort}
                />
                <TableHead className="text-[#5b6b7c]">
                  {t("boats_col_owner")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("boats_col_port")}
                </TableHead>
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="price_per_day"
                  direction={filters.sortDirection}
                  labelKey="boats_col_price"
                  onSort={toggleSort}
                />
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="rating"
                  direction={filters.sortDirection}
                  labelKey="boats_col_rating"
                  onSort={toggleSort}
                />
                <TableHead className="text-[#5b6b7c]">
                  {t("boats_col_status")}
                </TableHead>
                <TableHead className="text-right text-[#5b6b7c]">
                  {t("users_col_actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boats.map((boat) => (
                <TableRow key={boat.id} className="hover:bg-[#f4f6f9]">
                  <TableCell>
                    <span className="block font-medium text-[#1a2b48]">
                      {boat.name}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {t(BOAT_TYPE_LABEL_KEYS[boat.type])}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block text-[#1a2b48]">
                      {boat.ownerName ?? "—"}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {boat.ownerEmail ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#1a2b48]">
                    {boat.portName ?? "—"}
                  </TableCell>
                  <TableCell className="text-[#1a2b48]">
                    {priceFormatter.format(Number(boat.price_per_day))}
                  </TableCell>
                  <TableCell className="text-[#1a2b48]">
                    {Number(boat.rating).toFixed(1)}
                  </TableCell>
                  <TableCell>
                    {boat.is_published ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {t("status_published")}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {t("status_draft")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        className="h-8 text-[#1a2b48]"
                        size="sm"
                        variant="ghost"
                      >
                        <Link href={`/boats/${boat.id}`}>
                          {t("boats_action_view")}
                        </Link>
                      </Button>
                      <Button
                        className="h-8 border-neutral-200 text-[#1a2b48]"
                        disabled={setPublished.isPending}
                        onClick={() =>
                          void togglePublished(boat.id, boat.is_published)
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {boat.is_published
                          ? t("boats_action_unpublish")
                          : t("boats_action_publish")}
                      </Button>
                    </div>
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
