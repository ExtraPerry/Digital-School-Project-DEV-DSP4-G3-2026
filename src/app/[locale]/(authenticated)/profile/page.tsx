import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfilePageContent } from "@/components/profile/profile-page-content";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Pages.ProfilePage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-800">
      <SiteHeader />
      <ProfilePageContent />
      <SiteFooter />
    </div>
  );
}
