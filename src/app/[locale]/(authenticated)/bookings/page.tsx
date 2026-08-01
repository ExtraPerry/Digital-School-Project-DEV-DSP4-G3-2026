import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { BookingsPageContent } from "@/components/bookings/bookings-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Pages.BookingsPage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <BookingsPageContent />
    </Suspense>
  );
}
