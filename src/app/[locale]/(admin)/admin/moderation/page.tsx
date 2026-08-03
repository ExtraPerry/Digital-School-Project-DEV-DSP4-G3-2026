import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminModerationQueue } from "@/components/admin/admin-moderation-queue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.AdminSpace" });

  return {
    title: t("meta_moderation_title"),
    description: t("meta_moderation_description"),
  };
}

export default async function AdminModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages.AdminSpace");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1a2b48]">
          {t("moderation_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("moderation_subtitle")}</p>
      </div>

      <AdminModerationQueue />
    </div>
  );
}
