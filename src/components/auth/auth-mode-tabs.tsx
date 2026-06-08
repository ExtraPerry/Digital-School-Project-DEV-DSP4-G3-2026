"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AuthModeTabs() {
  const t = useTranslations("Pages.AuthPage");
  const pathname = usePathname();
  const isLogin = pathname.endsWith("/login");

  return (
    <div className="flex w-full rounded-full bg-neutral-100 p-1">
      <Link
        className={cn(
          "flex flex-1 items-center justify-center rounded-full py-2.5 text-sm font-medium transition-colors",
          isLogin
            ? "bg-[#1a2b48] text-white"
            : "text-neutral-500 hover:text-neutral-700",
        )}
        href="/login"
      >
        {t("tab_login")}
      </Link>
      <Link
        className={cn(
          "flex flex-1 items-center justify-center rounded-full py-2.5 text-sm font-medium transition-colors",
          !isLogin
            ? "bg-[#1a2b48] text-white"
            : "text-neutral-500 hover:text-neutral-700",
        )}
        href="/register"
      >
        {t("tab_register")}
      </Link>
    </div>
  );
}
