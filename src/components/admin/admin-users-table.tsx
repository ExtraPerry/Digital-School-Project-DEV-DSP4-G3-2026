"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { USER_ROLE_LABEL_KEYS } from "@/components/admin/admin-label-keys";
import { AdminUserRowActions } from "@/components/admin/admin-user-row-actions";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSortableHeader } from "@/components/admin/admin-sortable-header";
import { useAdminFilters } from "@/components/admin/use-admin-filters";
import {
  DEFAULT_ADMIN_USERS_FILTERS,
  type AdminUsersFilters,
  type AdminUsersSortColumn,
} from "@/queries/fetchAdminUsers";

const ACCOUNT_STATUS_LABEL_KEYS = {
  ACTIVE: "status_active",
  PENDING: "status_pending",
  SUSPENDED: "status_suspended",
} as const;

const ACCOUNT_STATUS_BADGE_CLASSES = {
  ACTIVE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  SUSPENDED: "bg-red-100 text-red-700 hover:bg-red-100",
} as const;

const ROLE_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "VISITOR", labelKey: "role_visitor" },
  { value: "RENTER", labelKey: "role_renter" },
  { value: "OWNER", labelKey: "role_owner" },
  { value: "ADMINISTRATOR", labelKey: "role_administrator" },
] as const;

const STATUS_OPTIONS = [
  { value: "ALL", labelKey: "filter_all" },
  { value: "ACTIVE", labelKey: "status_active" },
  { value: "SUSPENDED", labelKey: "status_suspended" },
] as const;

export function AdminUsersTable({
  limit,
  showActions = false,
  showToolbar = false,
}: {
  limit?: number;
  showActions?: boolean;
  showToolbar?: boolean;
}) {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { filters, setSearch, setPage, setFilterValue, toggleSort } =
    useAdminFilters<AdminUsersSortColumn, AdminUsersFilters>(
      DEFAULT_ADMIN_USERS_FILTERS,
    );
  const { data, isLoading, isError } = useAdminUsers(filters);
  const { data: currentUser } = useCurrentUser();

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const users = data?.rows ?? [];
  const visibleUsers = limit ? users.slice(0, limit) : users;

  return (
    <div className="flex flex-col gap-4">
      {showToolbar ? (
        <AdminTableToolbar
          filters={[
            {
              id: "admin-users-role",
              labelKey: "users_col_role",
              value: filters.role,
              options: ROLE_OPTIONS,
              onChange: (value) => setFilterValue("role", value),
            },
            {
              id: "admin-users-status",
              labelKey: "users_col_status",
              value: filters.status,
              options: STATUS_OPTIONS,
              onChange: (value) => setFilterValue("status", value),
            },
          ]}
          onSearchChange={setSearch}
          resultCount={data?.total ?? null}
          search={filters.search}
          searchPlaceholderKey="users_search_placeholder"
        />
      ) : null}

      {isError ? (
        <p className="text-sm text-neutral-500">{t("error_load")}</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">{t("loading")}</p>
      ) : visibleUsers.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {showToolbar && data && data.total === 0 && filters.search
            ? t("empty_filtered")
            : t("empty")}
        </p>
      ) : (
        <>
          <Table className="text-[#1a2b48]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="last_name"
                  direction={filters.sortDirection}
                  labelKey="users_col_user"
                  onSort={toggleSort}
                />
                <TableHead className="text-[#5b6b7c]">
                  {t("users_col_role")}
                </TableHead>
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="created_at"
                  direction={filters.sortDirection}
                  labelKey="users_col_joined"
                  onSort={toggleSort}
                />
                <TableHead className="text-[#5b6b7c]">
                  {t("users_col_contact")}
                </TableHead>
                <AdminSortableHeader
                  activeColumn={filters.sortColumn}
                  column="account_status"
                  direction={filters.sortDirection}
                  labelKey="users_col_status"
                  onSort={toggleSort}
                />
                {showActions ? (
                  <TableHead className="text-right text-[#5b6b7c]">
                    {t("users_col_actions")}
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((user) => {
                const fullName = [user.first_name, user.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim();

                return (
                  <TableRow key={user.id} className="hover:bg-[#f4f6f9]">
                    <TableCell>
                      <span className="block font-medium text-[#1a2b48]">
                        {fullName.length > 0 ? fullName : "—"}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {user.email ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#1a2b48]">
                      {user.role
                        ? t(USER_ROLE_LABEL_KEYS[user.role])
                        : t("role_none")}
                    </TableCell>
                    <TableCell className="text-[#1a2b48]">
                      {dateFormatter.format(new Date(user.created_at))}
                    </TableCell>
                    <TableCell>
                      {user.canBePromoted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          {t("users_contact_complete")}
                        </Badge>
                      ) : (
                        <Badge
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                          title={t("users_contact_incomplete_hint")}
                        >
                          {t("users_contact_incomplete")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          ACCOUNT_STATUS_BADGE_CLASSES[user.account_status]
                        }
                      >
                        {t(ACCOUNT_STATUS_LABEL_KEYS[user.account_status])}
                      </Badge>
                    </TableCell>
                    {showActions ? (
                      <TableCell className="text-right">
                        <AdminUserRowActions
                          displayName={
                            fullName.length > 0 ? fullName : (user.email ?? "—")
                          }
                          isSelf={currentUser?.id === user.id}
                          user={user}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {limit ? null : (
            <AdminPagination
              onPageChange={setPage}
              page={data?.page ?? 1}
              pageCount={data?.pageCount ?? 1}
            />
          )}
        </>
      )}
    </div>
  );
}
