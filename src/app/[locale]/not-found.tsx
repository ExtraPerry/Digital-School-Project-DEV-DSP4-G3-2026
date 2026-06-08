import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default async function LocaleNotFound({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const { locale } = params
    ? await params
    : { locale: routing.defaultLocale };
  const t = await getTranslations({
    locale: locale,
    namespace: "Pages.NotFoundPage",
  });

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      <h1>404</h1>
      <h2>{t("title")}</h2>
    </>
  );
}
