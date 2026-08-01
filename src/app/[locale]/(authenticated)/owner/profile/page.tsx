"use client";

import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export default function OwnerProfilePage() {
  const t = useTranslations("Pages.OwnerSpace");
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: roleRow, isLoading: roleLoading } = useCurrentUserRole();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-[#1a2b48]">
        {t("profile_page_title")}
      </h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {userLoading || roleLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-neutral-500">{t("profile_first_name")}</dt>
              <dd className="text-sm font-medium text-[#1a2b48]">
                {user?.first_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t("profile_last_name")}</dt>
              <dd className="text-sm font-medium text-[#1a2b48]">
                {user?.last_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t("profile_email")}</dt>
              <dd className="text-sm font-medium text-[#1a2b48]">
                {user?.email ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t("profile_phone")}</dt>
              <dd className="text-sm font-medium text-[#1a2b48]">
                {user?.phone ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t("profile_role")}</dt>
              <dd className="text-sm font-medium text-[#1a2b48]">
                {roleRow?.role ?? "—"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
