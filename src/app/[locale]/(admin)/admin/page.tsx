import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminModerationQueue } from "@/components/admin/admin-moderation-queue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.AdminSpace" });

  return {
    title: t("meta_dashboard_title"),
    description: t("meta_dashboard_description"),
  };
}

export default async function AdminDashboardPage({
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
          {t("dashboard_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("dashboard_subtitle")}</p>
      </div>

      <AdminStatCards />

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a2b48]">
            {t("dashboard_recent_users")}
          </h2>
          <Link
            className="text-sm font-medium text-[#D68A6E] hover:underline"
            href="/admin/users"
          >
            {t("view_all")}
          </Link>
        </div>
        <AdminUsersTable limit={5} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a2b48]">
            {t("dashboard_moderation_queue")}
          </h2>
          <Link
            className="text-sm font-medium text-[#D68A6E] hover:underline"
            href="/admin/moderation"
          >
            {t("view_all")}
          </Link>
        </div>
        <AdminModerationQueue limit={3} />
      </div>
    </div>
  );
}
