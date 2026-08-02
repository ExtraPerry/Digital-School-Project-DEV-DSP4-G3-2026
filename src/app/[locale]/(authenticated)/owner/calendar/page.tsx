import { getTranslations } from "next-intl/server";
import { OwnerCalendarManager } from "@/components/owner/owner-calendar-manager";

export default async function OwnerCalendarPage() {
  const t = await getTranslations("Pages.OwnerSpace");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1a2b48]">
          {t("calendar_page_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {t("calendar_page_subtitle")}
        </p>
      </div>
      <OwnerCalendarManager />
    </div>
  );
}
