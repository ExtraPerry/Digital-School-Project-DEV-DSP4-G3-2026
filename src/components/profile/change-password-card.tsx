"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdatePassword,
  WRONG_CURRENT_PASSWORD,
} from "@/hooks/useProfileMutations";

/** Matches the floor the sign-up form enforces, so an account cannot be weakened. */
const MINIMUM_PASSWORD_LENGTH = 8;

/**
 * Lets a signed-in member change their password without going through the
 * email recovery flow. The current password is required — see
 * `useUpdatePassword` for why the session alone is not accepted as proof.
 */
export function ChangePasswordCard() {
  const t = useTranslations("Pages.ProfilePage");
  const updatePassword = useUpdatePassword();

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, t("validation_current_password")),
      newPassword: z
        .string()
        .min(MINIMUM_PASSWORD_LENGTH, t("validation_password_min")),
      confirmPassword: z.string(),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      message: t("validation_password_match"),
      path: ["confirmPassword"],
    })
    .refine((value) => value.newPassword !== value.currentPassword, {
      message: t("validation_password_reuse"),
      path: ["newPassword"],
    });

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const validated = passwordSchema.parse(value);

      try {
        await updatePassword.mutateAsync({
          currentPassword: validated.currentPassword,
          newPassword: validated.newPassword,
        });
        toast.success(t("password_success"));
        form.reset();
      } catch (error) {
        const isWrongPassword =
          error instanceof Error && error.message === WRONG_CURRENT_PASSWORD;

        toast.error(
          isWrongPassword ? t("password_error_current") : t("password_error"),
        );
      }
    },
  });

  const fields = [
    {
      name: "currentPassword",
      label: t("current_password_label"),
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: t("new_password_label"),
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: t("confirm_password_label"),
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1a2b48]">
        {t("password_heading")}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">{t("password_subtitle")}</p>

      <form
        className="mt-5 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ name, label, autoComplete }) => (
            <form.Field
              key={name}
              name={name}
              validators={{
                //? Cross-field rules (match, reuse) live on the whole object, so
                //? each field re-validates against the schema as a whole and
                //? keeps only the issues that point at itself.
                onChangeListenTo: ["currentPassword", "newPassword"],
                onChange: ({ fieldApi }) => {
                  const result = passwordSchema.safeParse(
                    fieldApi.form.state.values,
                  );

                  if (result.success) {
                    return undefined;
                  }

                  return result.error.issues.find(
                    (issue) => issue.path[0] === name,
                  )?.message;
                },
              }}
            >
              {(field) => (
                <div
                  className={
                    name === "currentPassword"
                      ? "flex flex-col gap-1.5 sm:col-span-2"
                      : "flex flex-col gap-1.5"
                  }
                >
                  <Label htmlFor={field.name}>{label}</Label>
                  <Input
                    autoComplete={autoComplete}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-sm text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          ))}
        </div>

        <div>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
                disabled={!canSubmit || updatePassword.isPending}
                type="submit"
              >
                {updatePassword.isPending
                  ? t("password_saving")
                  : t("password_save")}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}
