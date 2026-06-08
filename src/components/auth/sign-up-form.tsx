"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthModeTabs } from "@/components/auth/auth-mode-tabs";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignUp } from "@/hooks/use-sign-up";
import { cn } from "@/lib/utils";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export function SignUpForm() {
  const t = useTranslations("Pages.AuthPage");
  const { authErrorKey, isSubmitting, signUpWithEmail, continueWithGoogle } =
    useSignUp();

  const signUpSchema = z.object({
    fullName: z.string().min(2, t("validation_full_name")),
    email: z.email(t("validation_email")),
    password: z.string().min(8, t("validation_password_min")),
    birthDate: z.string().min(1, t("validation_birth_date")),
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      birthDate: "",
    },
    onSubmit: async ({ value }) => {
      const validatedValues = signUpSchema.parse(value);
      await signUpWithEmail(validatedValues);
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
          {t("register_title")}
        </h1>
        <p className="text-sm text-neutral-500">{t("register_subtitle")}</p>
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
          name="fullName"
          validators={{
            onChange: ({ value }) => {
              if (value.length > 0 && value.length < 2) {
                return t("validation_full_name");
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{t("full_name_label")}</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                autoComplete="name"
                disabled={isSubmitting}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t("full_name_placeholder")}
                type="text"
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
                autoComplete="new-password"
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

        <form.Field
          name="birthDate"
          validators={{
            onChange: ({ value }) => {
              if (value.length === 0) {
                return undefined;
              }
              return undefined;
            },
            onSubmit: ({ value }) => {
              if (value.length === 0) {
                return t("validation_birth_date");
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{t("birth_date_label")}</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                autoComplete="bday"
                disabled={isSubmitting}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                type="date"
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

        <Button
          className="h-10 w-full rounded-lg bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t("submitting") : t("register_submit")}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-neutral-400">{t("or_divider")}</span>
        <Separator className="flex-1" />
      </div>

      <Button
        className="h-10 w-full gap-2 rounded-lg border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
        disabled={isSubmitting}
        onClick={() => void continueWithGoogle()}
        type="button"
        variant="outline"
      >
        <GoogleIcon />
        {t("google_continue")}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        {t("has_account")}{" "}
        <Link
          className="font-medium text-[#1a2b48] hover:underline"
          href="/login"
        >
          {t("sign_in_link")}
        </Link>
      </p>

      <p className="text-center text-xs text-neutral-400">
        {t("legal_notice")}
      </p>
    </div>
  );
}
