"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mapAdminMutationError,
  useAdminSetUserRole,
  useAdminSetUserStatus,
} from "@/hooks/useAdminMutations";
import { USER_ROLE_LABEL_KEYS } from "@/components/admin/admin-label-keys";
import { Constants, type Database } from "@/lib/supabase/database.types";
import type { AdminUser } from "@/queries/fetchAdminUsers";

type UserRoleType = Database["public"]["Enums"]["user_roles_type"];

export function AdminUserRowActions({
  user,
  displayName,
  isSelf,
}: {
  user: AdminUser;
  displayName: string;
  isSelf: boolean;
}) {
  const t = useTranslations("Pages.AdminSpace");
  const setRole = useAdminSetUserRole();
  const setStatus = useAdminSetUserStatus();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const isSuspended = user.account_status === "SUSPENDED";

  const roleSchema = z.object({
    role: z.enum(Constants.public.Enums.user_roles_type),
  });

  const roleForm = useForm({
    defaultValues: { role: (user.role ?? "VISITOR") as UserRoleType },
    onSubmit: async ({ value }) => {
      const validated = roleSchema.parse(value);

      try {
        await setRole.mutateAsync({ userId: user.id, role: validated.role });
        toast.success(t("toast_role_updated"));
        setRoleDialogOpen(false);
      } catch (error) {
        toast.error(
          t(
            mapAdminMutationError(
              error instanceof Error ? error.message : "",
            ),
          ),
        );
      }
    },
  });

  async function handleStatusChange() {
    const nextStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

    try {
      await setStatus.mutateAsync({ userId: user.id, status: nextStatus });
      toast.success(
        isSuspended ? t("toast_status_activated") : t("toast_status_suspended"),
      );
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error(
        t(mapAdminMutationError(error instanceof Error ? error.message : "")),
      );
    }
  }

  //? The RPCs refuse self-targeted changes (they would let an administrator
  //? lock themselves out), so the controls are disabled rather than failing.
  if (isSelf) {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog onOpenChange={setRoleDialogOpen} open={roleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-8 border-neutral-200 text-[#1a2b48]"
            size="sm"
            variant="outline"
          >
            {t("action_change_role")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("role_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("role_dialog_description", { name: displayName })}
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void roleForm.handleSubmit();
            }}
          >
            <roleForm.Field name="role">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>{t("role_dialog_field")}</Label>
                  <Select
                    disabled={setRole.isPending}
                    onValueChange={(value) =>
                      field.handleChange(value as UserRoleType)
                    }
                    value={field.state.value}
                  >
                    <SelectTrigger className="w-full" id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.user_roles_type.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(USER_ROLE_LABEL_KEYS[role])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!user.canBePromoted ? (
                    <p className="text-xs text-amber-700">
                      {t("users_contact_incomplete_hint")}
                    </p>
                  ) : null}
                </div>
              )}
            </roleForm.Field>

            <DialogFooter>
              <Button
                className="border-neutral-200"
                disabled={setRole.isPending}
                onClick={() => setRoleDialogOpen(false)}
                type="button"
                variant="outline"
              >
                {t("dialog_cancel")}
              </Button>
              <Button
                className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
                disabled={setRole.isPending}
                type="submit"
              >
                {setRole.isPending ? t("saving") : t("role_dialog_submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setStatusDialogOpen} open={statusDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-8 border-neutral-200 text-[#1a2b48]"
            size="sm"
            variant="outline"
          >
            {isSuspended ? t("action_reactivate") : t("action_suspend")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isSuspended
                ? t("reactivate_dialog_title")
                : t("suspend_dialog_title")}
            </DialogTitle>
            <DialogDescription>
              {isSuspended
                ? t("reactivate_dialog_description", { name: displayName })
                : t("suspend_dialog_description", { name: displayName })}
            </DialogDescription>
          </DialogHeader>

          {!isSuspended ? (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              {t("suspend_dialog_warning")}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              className="border-neutral-200"
              disabled={setStatus.isPending}
              onClick={() => setStatusDialogOpen(false)}
              type="button"
              variant="outline"
            >
              {t("dialog_cancel")}
            </Button>
            <Button
              className={
                isSuspended
                  ? "bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
              disabled={setStatus.isPending}
              onClick={() => {
                void handleStatusChange();
              }}
              type="button"
            >
              {setStatus.isPending
                ? t("saving")
                : isSuspended
                  ? t("reactivate_dialog_submit")
                  : t("suspend_dialog_submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
