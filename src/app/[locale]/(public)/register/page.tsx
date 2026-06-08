import { AuthMaquetteShell } from "@/components/auth/auth-maquette-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
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
  const t = await getTranslations({ locale, namespace: "MetaDataAuth" });

  return {
    title: t("register_title"),
    description: t("register_description"),
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthMaquetteShell>
      <SignUpForm />
    </AuthMaquetteShell>
  );
}
