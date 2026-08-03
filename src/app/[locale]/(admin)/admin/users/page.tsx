import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.AdminSpace" });

  return {
    title: t("meta_users_title"),
    description: t("meta_users_description"),
  };
}

export default async function AdminUsersPage({
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
          {t("users_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("users_subtitle")}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <AdminUsersTable showActions showToolbar />
      </div>
    </div>
  );
}
