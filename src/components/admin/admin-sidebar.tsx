"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Ship,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { useRouter } from "@/i18n/navigation";
import { useAdminFlaggedReviewCount } from "@/hooks/useAdminFlaggedReviewCount";

const NAV_ITEMS = [
  { href: "/admin", labelKey: "nav_dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "nav_users", icon: Users },
  { href: "/admin/boats", labelKey: "nav_boats", icon: Ship },
  {
    href: "/admin/reservations",
    labelKey: "nav_reservations",
    icon: CalendarCheck,
  },
  {
    href: "/admin/moderation",
    labelKey: "nav_moderation",
    icon: MessageSquareWarning,
  },
  { href: "/admin/commissions", labelKey: "nav_commissions", icon: Wallet },
  { href: "/admin/security", labelKey: "nav_security", icon: ShieldCheck },
] as const;

export function AdminSidebar() {
  const t = useTranslations("Pages.AdminSpace");
  const pathname = usePathname();
  const router = useRouter();
  const { data: flaggedCount = 0 } = useAdminFlaggedReviewCount();

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

      <nav
        aria-label={t("sidebar_nav_label")}
        className="flex flex-1 flex-col gap-1 px-3"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
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
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.href === "/admin/moderation" && flaggedCount > 0 ? (
                <span
                  aria-label={t("moderation_badge_label", {
                    count: flaggedCount,
                  })}
                  className="rounded-full bg-[#D68A6E] px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white"
                >
                  {flaggedCount}
                </span>
              ) : null}
            </Link>
          );
        })}
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
