import { Figtree } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { TanstackQueryClient } from "@/contexts/tanstack-query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/contexts/theme-provider";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-figtree",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "MetaData",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html className="h-full" lang={locale} suppressHydrationWarning>
      <body className={cn(`${figtree.className} font-figtree antialiased`, "")}>
        <TanstackQueryClient>
          <NextIntlClientProvider>
            {/*
              The design is light-only: every page states its colours outright
              (bg-white, #1a2b48, #f7f8fa) and there is no dark palette and no
              theme switch anywhere in the UI. Following the operating system
              therefore did not produce a dark site, it produced half a dark
              one — the shadcn primitives read `--popover`, `--input` and
              friends and flipped, while the pages holding them did not. A
              visitor on a dark OS got a near-black dialog carrying navy text
              and form fields whose borders had turned white on white.

              Forcing `light` pins those variables until a dark palette is
              actually designed. Until then, `enableSystem` is a promise the
              stylesheet cannot keep.
            */}
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              forcedTheme="light"
              disableTransitionOnChange
            >
              {children}
              <CookieConsentBanner />
              <Toaster position="bottom-right" />
            </ThemeProvider>
          </NextIntlClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </TanstackQueryClient>
      </body>
    </html>
  );
}
