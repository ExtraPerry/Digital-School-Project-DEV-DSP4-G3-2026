"use client";

import { useForm } from "@tanstack/react-form";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthModeTabs } from "@/components/auth/auth-mode-tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
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
  //? Holds the address the confirmation went to, which is also the flag for
  //? "account created, waiting on the mailbox".
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);

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
      const outcome = await signUpWithEmail(validatedValues);

      if (outcome === "confirmation-required") {
        setPendingConfirmationEmail(validatedValues.email);
      }
    },
  });

  if (pendingConfirmationEmail) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#D68A6E]/15 text-[#D68A6E]">
          <MailCheck aria-hidden className="size-6" />
        </div>
        <div className="flex flex-col gap-2">
          <h1
            className={cn(playfair.className, "text-3xl font-bold text-[#1a2b48]")}
          >
            {t("confirm_email_title")}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            {t.rich("confirm_email_text", {
              email: pendingConfirmationEmail,
              strong: (chunks) => (
                <strong className="font-semibold text-[#1a2b48]">
                  {chunks}
                </strong>
              ),
            })}
          </p>
          <p className="text-sm leading-relaxed text-neutral-500">
            {t("confirm_email_hint")}
          </p>
        </div>
        <Button
          asChild
          className="h-10 w-full rounded-lg bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
        >
          <Link href="/login">{t("confirm_email_cta")}</Link>
        </Button>
      </div>
    );
  }

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

      <GoogleAuthButton
        isSubmitting={isSubmitting}
        onContinue={() => void continueWithGoogle()}
      />

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
