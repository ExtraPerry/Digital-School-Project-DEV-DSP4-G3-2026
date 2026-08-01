"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

type SiteHeaderAuthActionsProps = {
  isAuthenticated: boolean;
  firstName: string | null;
  isOwner: boolean;
};

export function SiteHeaderAuthActions({
  isAuthenticated,
  firstName,
  isOwner,
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
      <div className="flex items-center gap-3">
        <Button
          asChild
          className="rounded-md border border-white/40 bg-transparent px-5 text-white shadow-none hover:bg-white/10"
          size="sm"
          variant="ghost"
        >
          <Link href="/login">{t("nav_login")}</Link>
        </Button>
        <Button
          asChild
          className="rounded-md bg-[#D68A6E] px-5 text-white hover:bg-[#c57d5f]"
          size="sm"
        >
          <Link href="/register">{t("nav_register")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {firstName ? (
        <span className="hidden text-sm text-white/90 sm:inline">
          {t("nav_greeting", { name: firstName })}
        </span>
      ) : null}
      {isOwner ? (
        <Button
          asChild
          className="rounded-md bg-[#D68A6E] px-5 text-white hover:bg-[#c57d5f]"
          size="sm"
        >
          <Link href="/owner">{t("nav_owner_space")}</Link>
        </Button>
      ) : null}
      <Button
        className="rounded-md border border-white/40 bg-transparent px-5 text-white shadow-none hover:bg-white/10"
        onClick={() => {
          void handleSignOut();
        }}
        size="sm"
        type="button"
        variant="ghost"
      >
        {t("nav_logout")}
      </Button>
    </div>
  );
}
