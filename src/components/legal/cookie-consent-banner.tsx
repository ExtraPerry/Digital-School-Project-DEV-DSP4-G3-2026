"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_STORAGE_KEY = "sailingloc-cookie-consent";

type CookieConsentChoice = "accepted" | "rejected";

export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const [hasResolvedConsent, setHasResolvedConsent] = useState(false);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY,
    );
    setShouldShowBanner(storedConsent === null);
    setHasResolvedConsent(true);
  }, []);

  function recordConsent(choice: CookieConsentChoice) {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    setShouldShowBanner(false);
  }

  if (!hasResolvedConsent || !shouldShowBanner) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur"
      role="dialog"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-neutral-600">
          {t("message")}{" "}
          <Link
            className="font-medium text-[#1a2b48] underline underline-offset-2"
            href="/cookies"
          >
            {t("learn_more")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            onClick={() => recordConsent("rejected")}
            size="lg"
            variant="outline"
          >
            {t("reject")}
          </Button>
          <Button
            className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
            onClick={() => recordConsent("accepted")}
            size="lg"
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
