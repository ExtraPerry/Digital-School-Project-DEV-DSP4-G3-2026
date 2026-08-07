"use client";

import { ChevronDown, CircleUserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

type SiteHeaderAuthActionsProps = {
  isAuthenticated: boolean;
  firstName: string | null;
  isOwner: boolean;
  isAdmin: boolean;
};

export function SiteHeaderAuthActions({
  isAuthenticated,
  firstName,
  isOwner,
  isAdmin,
}: SiteHeaderAuthActionsProps) {
  const t = useTranslations("Pages.LandingPage");
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!isAuthenticated) {
    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          asChild
          className="rounded-md border border-white/40 bg-transparent px-3 text-white shadow-none hover:bg-white/10 sm:px-5"
          size="sm"
          variant="ghost"
        >
          <Link href="/login">{t("nav_login")}</Link>
        </Button>
        <Button
          asChild
          className="hidden rounded-md bg-[#D68A6E] px-5 text-white hover:bg-[#c57d5f] sm:inline-flex"
          size="sm"
        >
          <Link href="/register">{t("nav_register")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isOwner ? (
        <Button
          asChild
          className="rounded-md bg-[#D68A6E] px-5 text-white hover:bg-[#c57d5f]"
          size="sm"
        >
          <Link href="/owner">{t("nav_owner_space")}</Link>
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-md border border-white/40 bg-transparent px-4 text-white shadow-none hover:bg-white/10 hover:text-white"
            size="sm"
            type="button"
            variant="ghost"
          >
            <CircleUserRound aria-hidden className="size-4" />
            {firstName
              ? t("nav_greeting", { name: firstName })
              : t("nav_account")}
            <ChevronDown aria-hidden className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {isAdmin ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin">{t("nav_admin_space")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/profile">{t("nav_profile")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/bookings">{t("nav_bookings")}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              void handleSignOut();
            }}
            variant="destructive"
          >
            {t("nav_logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
