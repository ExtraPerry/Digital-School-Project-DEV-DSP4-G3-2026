import { AuthMaquetteShell } from "@/components/auth/auth-maquette-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
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
    title: t("login_title"),
    description: t("login_description"),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthMaquetteShell>
      <SignInForm />
    </AuthMaquetteShell>
  );
}
