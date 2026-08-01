import { getTranslations } from "next-intl/server";
import { OwnerBoatForm } from "@/components/owner/owner-boat-form";

export default async function OwnerNewBoatPage() {
  const t = await getTranslations("Pages.OwnerSpace");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-[#1a2b48]">
        {t("boats_new_title")}
      </h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <OwnerBoatForm />
      </div>
    </div>
  );
}
