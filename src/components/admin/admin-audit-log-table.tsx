"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import { Database } from "@/lib/supabase/database.types";

type AdminActionType = Database["public"]["Enums"]["admin_action_type"];

const ACTION_LABEL_KEYS: Record<AdminActionType, string> = {
  SET_USER_ROLE: "audit_action_set_user_role",
  SET_USER_STATUS: "audit_action_set_user_status",
  MODERATE_REVIEW: "audit_action_moderate_review",
  PUBLISH_BOAT: "audit_action_publish_boat",
  UNPUBLISH_BOAT: "audit_action_unpublish_boat",
};

//? Only these jsonb keys are ever written by the admin RPCs. Anything else is
//? skipped rather than rendered raw, so no untranslated database string can
//? reach the UI.
const DETAIL_LABEL_KEYS: Record<string, string> = {
  previous_role: "audit_detail_previous_role",
  new_role: "audit_detail_new_role",
  previous_status: "audit_detail_previous_status",
  new_status: "audit_detail_new_status",
  boats_unpublished: "audit_detail_boats_unpublished",
};

export function AdminAuditLogTable() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data: entries = [], isLoading, isError } = useAdminAuditLog();

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-lg bg-[#eef1f6] px-4 py-3 text-xs text-[#5b6b7c]">
        <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("audit_intro")}
      </p>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        {isError ? (
          <p className="text-sm text-neutral-500">{t("error_load")}</p>
        ) : isLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <Table className="text-[#1a2b48]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#5b6b7c]">
                  {t("audit_col_when")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("audit_col_actor")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("audit_col_action")}
                </TableHead>
                <TableHead className="text-[#5b6b7c]">
                  {t("audit_col_details")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const details =
                  entry.details && typeof entry.details === "object"
                    ? (entry.details as Record<string, unknown>)
                    : {};

                return (
                  <TableRow key={entry.id} className="hover:bg-[#f4f6f9]">
                    <TableCell className="whitespace-nowrap text-[#1a2b48]">
                      {dateTimeFormatter.format(new Date(entry.created_at))}
                    </TableCell>
                    <TableCell>
                      <span className="block text-[#1a2b48]">
                        {entry.actorName ?? "—"}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {entry.actor_email_snapshot ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#1a2b48]">
                      {t(ACTION_LABEL_KEYS[entry.action])}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(details)
                          .filter(([key]) => DETAIL_LABEL_KEYS[key])
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="rounded bg-[#eef1f6] px-2 py-0.5 text-xs text-[#5b6b7c]"
                            >
                              {t(DETAIL_LABEL_KEYS[key])}: {String(value)}
                            </span>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
