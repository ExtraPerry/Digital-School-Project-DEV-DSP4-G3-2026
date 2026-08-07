import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useTranslations } from "next-intl";
import { SailingLocLogo } from "@/components/brand/sailing-loc-logo";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type AuthMaquetteShellProps = {
  children: React.ReactNode;
};

export function AuthMaquetteShell({ children }: AuthMaquetteShellProps) {
  const t = useTranslations("Pages.AuthPage");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <section
          aria-hidden
          className="relative isolate hidden flex-col justify-between overflow-hidden bg-[#1a2b48] p-10 text-white lg:flex"
        >
          <Image
            alt=""
            className="-z-20 object-cover object-center"
            fill
            priority
            sizes="50vw"
            src="/images/brand/auth-sea.webp"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#13233d]/92 via-[#1a2b48]/68 to-[#3d7a8a]/28" />
          <SailingLocLogo className="relative z-10" variant="light" />
          <div className="relative z-10 flex flex-col gap-4">
            <p
              className={cn(
                playfair.className,
                "max-w-md text-3xl font-bold leading-snug",
              )}
            >
              &laquo; {t("hero_tagline")} &raquo;
            </p>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              {t("hero_subtext")}
            </p>
          </div>
          <p className="relative z-10 text-xs text-white/65">
            {t("hero_disclaimer")}
          </p>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  );
}
