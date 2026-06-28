import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.SearchPage" });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages.SearchPage");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f8fa] px-6 text-center text-neutral-800">
      <h1 className="text-2xl font-bold text-[#1a2b48]">{t("title")}</h1>
      <p className="max-w-md text-sm leading-relaxed text-neutral-600">
        {t("subtitle")}
      </p>
      <Link
        className="rounded-md bg-[#D68A6E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#c57d5f]"
        href="/"
      >
        {t("back_link")}
      </Link>
    </div>
  );
}
