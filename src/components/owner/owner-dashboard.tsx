"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus, Star } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
import { OwnerDocumentsGrid } from "@/components/owner/owner-documents-grid";
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

export function OwnerDashboard() {
  const t = useTranslations("Pages.OwnerSpace");
  const { data: currentUser } = useCurrentUser();
  const { data: boats = [], isLoading: boatsLoading } = useOwnerBoats();
  const { data: documents = [], isLoading: documentsLoading } =
    useOwnerDocuments();

  const averageRating = useMemo(() => {
    if (boats.length === 0) {
      return 0;
    }

    const total = boats.reduce((sum, boat) => sum + Number(boat.rating), 0);
    return total / boats.length;
  }, [boats]);

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a2b48]">
            {t("greeting", {
              name: currentUser?.first_name ?? t("greeting_fallback_name"),
            })}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{t("greeting_subtitle")}</p>
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("stat_revenue_label")}
          value={t("stat_revenue_placeholder")}
          hint={t("stat_revenue_hint")}
        />
        <StatCard
          label={t("stat_reservations_label")}
          value={t("stat_reservations_placeholder")}
          hint={t("stat_placeholder_hint")}
        />
        <StatCard
          label={t("stat_occupancy_label")}
          value={t("stat_occupancy_placeholder")}
          hint={t("stat_placeholder_hint")}
        />
        <StatCard
          label={t("stat_rating_label")}
          value={averageRating.toFixed(1)}
          hint={
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Star aria-hidden className="size-3.5 fill-current" />
              {t("stat_rating_hint")}
            </span>
          }
        />
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1a2b48]">
            {t("boats_section_title")}
          </h2>
          <Link
            className="text-sm font-medium text-[#D68A6E] hover:underline"
            href="/owner/boats"
          >
            {t("boats_section_see_all")}
          </Link>
        </div>

        {boatsLoading ? (
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
              {boats.slice(0, 5).map((boat) => {
                const canPublish = ownerHasRequiredPublishDocuments(
                  documents,
                  boat.id,
                );
                const actionLabel = boat.is_published
                  ? t("boats_action_edit")
                  : canPublish
                    ? t("boats_action_edit")
                    : t("boats_action_complete");

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
                        {actionLabel}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1a2b48]">
            {t("documents_section_title")}
          </h2>
          <Link
            className="text-sm font-medium text-[#D68A6E] hover:underline"
            href="/owner/documents"
          >
            {t("documents_section_manage")}
          </Link>
        </div>
        {documentsLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : (
          <OwnerDocumentsGrid compact />
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1a2b48]">{value}</p>
      <div className="mt-1 text-xs text-emerald-600">{hint}</div>
    </div>
  );
}
