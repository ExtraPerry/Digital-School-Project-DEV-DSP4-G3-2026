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
  }: SignUpInput) {
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
      return false;
    }

    if (data.user) {
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
        return false;
      }
    }

    setIsSubmitting(false);
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
    signUpWithEmail,
    continueWithGoogle,
  };
}
