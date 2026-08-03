import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminReservationsTable } from "@/components/admin/admin-reservations-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.AdminSpace" });

  return {
    title: t("meta_reservations_title"),
    description: t("meta_reservations_description"),
  };
}

export default async function AdminReservationsPage({
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
          {t("reservations_title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{t("reservations_subtitle")}</p>
      </div>

      <AdminReservationsTable />
    </div>
  );
}
