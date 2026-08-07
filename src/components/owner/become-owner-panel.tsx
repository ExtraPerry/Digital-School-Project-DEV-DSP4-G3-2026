"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useUpgradeToOwner } from "@/hooks/useOwnerMutations";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";

export function BecomeOwnerPanel() {
  const t = useTranslations("Pages.BecomeOwnerPage");
  const router = useRouter();
  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser();
  const {
    data: roleRow,
    isLoading: roleLoading,
    isError: roleError,
  } = useCurrentUserRole();
  const upgradeToOwner = useUpgradeToOwner();

  const role = roleRow?.role;
  const isAuthenticated = Boolean(currentUser);
  const canUpgrade = role === "RENTER";
  const alreadyOwner = role === "OWNER" || role === "ADMINISTRATOR";

  async function handleUpgrade() {
    try {
      await upgradeToOwner.mutateAsync();
      toast.success(t("success"));
      router.push("/owner");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    }
  }

  if (userLoading || roleLoading) {
    return <p className="text-sm text-neutral-500">{t("loading")}</p>;
  }

  if (userError || roleError) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{t("profile_error")}</p>
        <Button asChild className="w-fit bg-[#1a2b48] text-white hover:bg-[#243960]">
          <Link href="/">{t("go_home")}</Link>
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{t("login_required")}</p>
        <div className="flex gap-3">
          <Button asChild className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]">
            <Link href="/login">{t("login_cta")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">{t("register_cta")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (alreadyOwner) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{t("already_owner")}</p>
        <Button asChild className="w-fit bg-[#1a2b48] text-white hover:bg-[#243960]">
          <Link href="/owner">{t("go_to_dashboard")}</Link>
        </Button>
      </div>
    );
  }

  if (!canUpgrade) {
    //? Now that the role follows the email alone, and authentication cannot
    //? happen without one, this is effectively unreachable — it survives for
    //? the account whose email was somehow cleared. Keep it pointing at the
    //? profile rather than dead-ending.
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{t("renter_required")}</p>
        <p className="text-xs text-neutral-500">{t("renter_required_hint")}</p>
        <Button
          asChild
          className="w-fit bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
        >
          <Link href="/profile">{t("complete_profile_cta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">{t("description")}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">
        <li>{t("benefit_1")}</li>
        <li>{t("benefit_2")}</li>
        <li>{t("benefit_3")}</li>
      </ul>
      <Button
        className="w-fit rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
        disabled={upgradeToOwner.isPending}
        onClick={() => {
          void handleUpgrade();
        }}
        type="button"
      >
        {t("cta")}
      </Button>
    </div>
  );
}
