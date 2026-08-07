"use client";

import { useTranslations } from "next-intl";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";

/**
 * Whether the Google provider is switched on for the Supabase project the app
 * points at.
 *
 * It is not, today. `signInWithOAuth` navigates the whole page to
 * `/auth/v1/authorize`, and an auth server that does not have the provider
 * enabled answers `validation_failed: Unsupported provider: provider is not
 * enabled` — so the visitor leaves the site and lands on a raw JSON body with
 * no way back except the browser's back button. Announcing the control as
 * upcoming is the honest reading of that state and keeps the dead end
 * unreachable.
 *
 * Everything behind the button is already wired. Flip this to `true` once the
 * dashboard reports the provider as on — nothing else needs to change:
 *
 *   curl "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" -H "apikey: $ANON_KEY"
 *   → "external": { ..., "google": true }
 */
const IS_GOOGLE_SIGN_IN_ENABLED = false;

/**
 * The "Continue with Google" control, shared by the sign-in and sign-up forms
 * so the two can never drift into disagreeing about whether it works.
 */
export function GoogleAuthButton({
  isSubmitting,
  onContinue,
}: {
  isSubmitting: boolean;
  onContinue: () => void;
}) {
  const t = useTranslations("Pages.AuthPage");

  if (!IS_GOOGLE_SIGN_IN_ENABLED) {
    //? Deliberately not a disabled <button>: a disabled control drops out of
    //? keyboard navigation and its label goes unannounced, so the "soon" would
    //? only ever reach people who can see it. Plain text is read in place.
    return (
      <div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-400">
        <span aria-hidden className="opacity-40 grayscale">
          <GoogleIcon />
        </span>
        {t("google_continue")}
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {t("google_soon")}
        </span>
      </div>
    );
  }

  return (
    <Button
      className="h-10 w-full gap-2 rounded-lg border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      disabled={isSubmitting}
      onClick={onContinue}
      type="button"
      variant="outline"
    >
      <GoogleIcon />
      {t("google_continue")}
    </Button>
  );
}
