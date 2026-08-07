import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LegalDocument } from "@/components/legal/legal-document";

export async function generateMetadata() {
  const t = await getTranslations({
    locale: "en",
    namespace: "Pages.CGVPage",
  });

  return { title: `${t("title")} — SailingLoc` };
}

export default function TermsOfSalesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
        <LegalDocument namespace="Pages.CGVPage" />
      </main>
      <SiteFooter />
    </div>
  );
}
