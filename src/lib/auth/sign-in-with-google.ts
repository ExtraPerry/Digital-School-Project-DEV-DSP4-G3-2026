import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

export async function signInWithGoogle(locale: string) {
  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback?locale=${locale}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}
