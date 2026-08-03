import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminBoatsTable } from "@/components/admin/admin-boats-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.AdminSpace" });

  return {
    title: t("meta_boats_title"),
    description: t("meta_boats_description"),
  };
}

export default async function AdminBoatsPage({
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
          {t("boats_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("boats_subtitle")}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <AdminBoatsTable />
      </div>
    </div>
  );
}
