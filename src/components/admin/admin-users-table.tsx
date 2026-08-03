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

export function AdminUsersTable({
  limit,
  showActions = false,
}: {
  limit?: number;
  showActions?: boolean;
}) {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data: users = [], isLoading, isError } = useAdminUsers();
  const { data: currentUser } = useCurrentUser();

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const visibleUsers = limit ? users.slice(0, limit) : users;

  if (isError) {
    return <p className="text-sm text-neutral-500">{t("error_load")}</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">{t("loading")}</p>;
  }

  if (visibleUsers.length === 0) {
    return <p className="text-sm text-neutral-500">{t("empty")}</p>;
  }

  return (
    <Table className="text-[#1a2b48]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-[#5b6b7c]">{t("users_col_user")}</TableHead>
          <TableHead className="text-[#5b6b7c]">{t("users_col_role")}</TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("users_col_joined")}
          </TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("users_col_contact")}
          </TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("users_col_status")}
          </TableHead>
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
                {user.role ? t(USER_ROLE_LABEL_KEYS[user.role]) : t("role_none")}
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
                    displayName={fullName.length > 0 ? fullName : (user.email ?? "—")}
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
  );
}
