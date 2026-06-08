import type { AuthErrorKey } from "@/lib/supabase/map-auth-error";

type AuthErrorAlertProps = {
  errorKey: AuthErrorKey;
  message: string;
};

export function AuthErrorAlert({ errorKey, message }: AuthErrorAlertProps) {
  return (
    <p
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
      data-error-key={errorKey}
    >
      {message}
    </p>
  );
}
