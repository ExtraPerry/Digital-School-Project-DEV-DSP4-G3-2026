"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const locale = useLocale();
  const pathname = usePathname();

  const activeClass =
    variant === "dark" ? "text-white" : "text-[#1a2b48]";
  const inactiveClass =
    variant === "dark"
      ? "text-white/50 hover:text-white/80"
      : "text-neutral-400 hover:text-neutral-600";
  const separatorClass =
    variant === "dark" ? "text-white/30" : "text-neutral-300";

  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <Link
        className={cn(
          "rounded px-1.5 py-0.5 font-medium transition-colors",
          locale === "fr" ? activeClass : inactiveClass,
        )}
        href={pathname}
        locale="fr"
      >
        FR
      </Link>
      <span className={separatorClass}>|</span>
      <Link
        className={cn(
          "rounded px-1.5 py-0.5 font-medium transition-colors",
          locale === "en" ? activeClass : inactiveClass,
        )}
        href={pathname}
        locale="en"
      >
        EN
      </Link>
    </div>
  );
}
