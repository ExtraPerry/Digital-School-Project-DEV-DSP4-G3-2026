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
import { useAdminBoats } from "@/hooks/useAdminBoats";
import { BOAT_TYPE_LABEL_KEYS } from "@/components/admin/admin-label-keys";

export function AdminBoatsTable() {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data: boats = [], isLoading, isError } = useAdminBoats();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  if (isError) {
    return <p className="text-sm text-neutral-500">{t("error_load")}</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">{t("loading")}</p>;
  }

  if (boats.length === 0) {
    return <p className="text-sm text-neutral-500">{t("empty")}</p>;
  }

  return (
    <Table className="text-[#1a2b48]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-[#5b6b7c]">{t("boats_col_boat")}</TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("boats_col_owner")}
          </TableHead>
          <TableHead className="text-[#5b6b7c]">{t("boats_col_port")}</TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("boats_col_price")}
          </TableHead>
          <TableHead className="text-[#5b6b7c]">
            {t("boats_col_status")}
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
