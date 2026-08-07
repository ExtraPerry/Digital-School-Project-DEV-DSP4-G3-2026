"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { splitFullName } from "@/lib/auth/split-full-name";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { mapAuthErrorMessage, type AuthErrorKey } from "@/lib/supabase/map-auth-error";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  birthDate: string;
};

/**
 * What `signUp` actually achieved.
 *
 * With email confirmation switched on — which it is — Supabase creates the
 * account but returns **no session**, so the visitor is still anonymous. The
 * form has to say so instead of redirecting them to a home page that quietly
 * shows them logged out.
 */
export type SignUpOutcome = "signed-in" | "confirmation-required" | "failed";

export function useSignUp() {
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorKey, setAuthErrorKey] = useState<AuthErrorKey | null>(null);

  async function signUpWithEmail({
    fullName,
    email,
    password,
    birthDate,
  }: SignUpInput): Promise<SignUpOutcome> {
    setIsSubmitting(true);
    setAuthErrorKey(null);

    const { firstName, lastName } = splitFullName(fullName);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setAuthErrorKey(mapAuthErrorMessage(error.message));
      return "failed";
    }

    //? Without a session there is no authenticated user, so the row-level
    //? policy on `users` would reject this update. The signup trigger has
    //? already provisioned the profile from the metadata passed above, so
    //? there is nothing to repair in that case either.
    if (data.session && data.user) {
      const { error: profileError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("auth_id", data.user.id);

      if (profileError) {
        setIsSubmitting(false);
        setAuthErrorKey("error_generic");
        return "failed";
      }
    }

    setIsSubmitting(false);

    if (!data.session) {
      // Account created, mailbox not yet visited. Redirecting now would drop
      // the visitor on the home page as an anonymous user with no explanation.
      return "confirmation-required";
    }

    router.push("/");
    router.refresh();
    return "signed-in";
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
    signUpWithEmail,
    continueWithGoogle,
  };
}
