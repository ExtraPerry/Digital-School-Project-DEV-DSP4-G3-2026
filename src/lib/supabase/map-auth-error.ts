export type AuthErrorKey =
  | "error_invalid_credentials"
  | "error_email_taken"
  | "error_weak_password"
  | "error_generic";

export function mapAuthErrorMessage(message: string): AuthErrorKey {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "error_invalid_credentials";
  }

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("user already registered")
  ) {
    return "error_email_taken";
  }

  if (normalizedMessage.includes("password")) {
    return "error_weak_password";
  }

  return "error_generic";
}
