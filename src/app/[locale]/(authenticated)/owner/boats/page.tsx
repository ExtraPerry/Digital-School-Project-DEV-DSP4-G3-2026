"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { useOwnerBoats } from "@/hooks/useOwnerBoats";
import { useOwnerDocuments } from "@/hooks/useOwnerDocuments";
import { ownerHasRequiredPublishDocuments } from "@/queries/fetchOwnerDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Constants } from "@/lib/supabase/database.types";

const BOAT_TYPE_LABEL_KEYS: Record<
  (typeof Constants.public.Enums.boat_type)[number],
  string
> = {
  SAILBOAT: "type_sailboat",
  MOTORBOAT: "type_motorboat",
  CATAMARAN: "type_catamaran",
  YACHT: "type_yacht",
};

export default function OwnerBoatsPage() {
  const t = useTranslations("Pages.OwnerSpace");
  const { data: boats = [], isLoading } = useOwnerBoats();
  const { data: documents = [] } = useOwnerDocuments();

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#1a2b48]">
          {t("boats_page_title")}
        </h1>
        <Button
          asChild
          className="rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
        >
          <Link href="/owner/boats/new">
            <Plus aria-hidden className="size-4" />
            {t("add_boat_cta")}
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : boats.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("boats_empty")}</p>
        ) : (
          <Table className="text-[#1a2b48]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#5b6b7c]">{t("boats_col_name")}</TableHead>
                <TableHead className="text-[#5b6b7c]">{t("boats_col_type")}</TableHead>
                <TableHead className="text-[#5b6b7c]">{t("boats_col_port")}</TableHead>
                <TableHead className="text-[#5b6b7c]">{t("boats_col_status")}</TableHead>
                <TableHead className="text-[#5b6b7c]">{t("boats_col_price")}</TableHead>
                <TableHead className="text-right text-[#5b6b7c]">
                  {t("boats_col_actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boats.map((boat) => {
                const canPublish = ownerHasRequiredPublishDocuments(
                  documents,
                  boat.id,
                );

                return (
                  <TableRow key={boat.id} className="hover:bg-[#f4f6f9]">
                    <TableCell className="font-medium text-[#1a2b48]">
                      {boat.name}
                    </TableCell>
                    <TableCell className="text-[#1a2b48]">
                      {t(BOAT_TYPE_LABEL_KEYS[boat.type])}
                    </TableCell>
                    <TableCell className="text-[#1a2b48]">
                      {boat.ports?.name ?? "—"}
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
                    <TableCell className="text-[#1a2b48]">
                      {t("price_per_day", {
                        price: priceFormatter.format(Number(boat.price_per_day)),
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        className="text-sm font-medium text-[#D68A6E] hover:underline"
                        href={`/owner/boats/${boat.id}/edit`}
                      >
                        {boat.is_published || canPublish
                          ? t("boats_action_edit")
                          : t("boats_action_complete")}
                      </Link>
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
