"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthModeTabs } from "@/components/auth/auth-mode-tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignIn } from "@/hooks/use-sign-in";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export function SignInForm() {
  const t = useTranslations("Pages.AuthPage");
  const { authErrorKey, isSubmitting, signInWithEmail, continueWithGoogle } =
    useSignIn();

  const signInSchema = z.object({
    email: z.email(t("validation_email")),
    password: z.string().min(8, t("validation_password_min")),
    rememberMe: z.boolean(),
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      const validatedValues = signInSchema.parse(value);
      await signInWithEmail(validatedValues.email, validatedValues.password);
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <AuthModeTabs />

      <div className="flex flex-col gap-2">
        <h1
          className={cn(
            playfair.className,
            "text-3xl font-bold text-[#1a2b48]",
          )}
        >
          {t("login_title")}
        </h1>
        <p className="text-sm text-neutral-500">{t("login_subtitle")}</p>
      </div>

      {authErrorKey ? (
        <AuthErrorAlert
          errorKey={authErrorKey}
          message={t(authErrorKey)}
        />
      ) : null}

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const result = z.email().safeParse(value);
              if (!result.success && value.length > 0) {
                return t("validation_email");
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{t("email_label")}</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                autoComplete="email"
                disabled={isSubmitting}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t("email_placeholder")}
                type="email"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <p className="text-xs text-destructive" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (value.length > 0 && value.length < 8) {
                return t("validation_password_min");
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{t("password_label")}</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                autoComplete="current-password"
                disabled={isSubmitting}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                type="password"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <p className="text-xs text-destructive" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between">
          <form.Field name="rememberMe">
            {(field) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.state.value}
                  disabled={isSubmitting}
                  id={field.name}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                />
                <Label className="font-normal" htmlFor={field.name}>
                  {t("remember_me")}
                </Label>
              </div>
            )}
          </form.Field>
          <Link
            className="text-sm text-[#c9866a] hover:underline"
            href="#"
          >
            {t("forgot_password")}
          </Link>
        </div>

        <Button
          className="h-10 w-full rounded-lg bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t("submitting") : t("login_submit")}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-neutral-400">{t("or_divider")}</span>
        <Separator className="flex-1" />
      </div>

      <GoogleAuthButton
        isSubmitting={isSubmitting}
        onContinue={() => void continueWithGoogle()}
      />

      <p className="text-center text-sm text-neutral-600">
        {t("no_account")}{" "}
        <Link
          className="font-medium text-[#1a2b48] hover:underline"
          href="/register"
        >
          {t("create_account")}
        </Link>
      </p>

      <p className="text-center text-xs text-neutral-400">
        {t("legal_notice")}
      </p>
    </div>
  );
}
