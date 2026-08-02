"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Ship,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { useRouter } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/owner", labelKey: "nav_dashboard", icon: LayoutDashboard },
  { href: "/owner/boats", labelKey: "nav_boats", icon: Ship },
  { href: "/owner/calendar", labelKey: "nav_calendar", icon: CalendarDays },
  { href: "/owner/documents", labelKey: "nav_documents", icon: FileText },
] as const;

export function OwnerSidebar() {
  const t = useTranslations("Pages.OwnerSpace");
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#1a2b48] text-white">
      <p className="px-6 pt-6 pb-3 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
        {t("sidebar_section")}
      </p>

      <nav aria-label={t("sidebar_nav_label")} className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/owner"
              ? pathname === "/owner"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
              href={item.href}
            >
              <Icon aria-hidden className="size-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}

        <Link
          className="mt-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          href="/owner/profile"
        >
          <UserRound aria-hidden className="size-4" />
          {t("nav_profile")}
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          onClick={() => {
            void handleSignOut();
          }}
          type="button"
        >
          <LogOut aria-hidden className="size-4" />
          {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
