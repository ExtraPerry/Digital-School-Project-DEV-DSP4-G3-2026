import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BecomeOwnerPanel } from "@/components/owner/become-owner-panel";

export default async function BecomeOwnerPage() {
  const t = await getTranslations("Pages.BecomeOwnerPage");

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-[#1a2b48]">{t("title")}</h1>
          <p className="mt-2 text-sm text-neutral-600">{t("subtitle")}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <BecomeOwnerPanel />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
