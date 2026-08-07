"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { OwnerBoatForm } from "@/components/owner/owner-boat-form";
import { useOwnerBoat } from "@/hooks/useOwnerBoats";

export default function OwnerEditBoatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Pages.OwnerSpace");
  const { data: boat, isLoading, error } = useOwnerBoat(id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-[#1a2b48]">
        {t("boats_edit_title", { name: boat?.name ?? "…" })}
      </h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : error || !boat ? (
          <p className="text-sm text-red-600">{t("boats_edit_not_found")}</p>
        ) : (
          <OwnerBoatForm boat={boat} />
        )}
      </div>
    </div>
  );
}
