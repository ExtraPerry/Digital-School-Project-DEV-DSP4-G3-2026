"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { mapAuthErrorMessage, type AuthErrorKey } from "@/lib/supabase/map-auth-error";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

export function useSignIn() {
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorKey, setAuthErrorKey] = useState<AuthErrorKey | null>(null);

  async function signInWithEmail(email: string, password: string) {
    setIsSubmitting(true);
    setAuthErrorKey(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setAuthErrorKey(mapAuthErrorMessage(error.message));
      return false;
    }

    router.push("/");
    router.refresh();
    return true;
  }

  async function continueWithGoogle() {
    setIsSubmitting(true);
    setAuthErrorKey(null);

    const { error } = await signInWithGoogle(locale);

    setIsSubmitting(false);

    if (error) {
      setAuthErrorKey(mapAuthErrorMessage(error.message));
      return false;
    }

    return true;
  }

  return {
    authErrorKey,
    isSubmitting,
    signInWithEmail,
    continueWithGoogle,
  };
}
