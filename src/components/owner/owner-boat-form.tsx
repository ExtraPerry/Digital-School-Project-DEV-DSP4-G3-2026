"use client";

import { useForm } from "@tanstack/react-form";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Constants } from "@/lib/supabase/database.types";
import { usePorts } from "@/hooks/usePorts";
import { useOwnerDocuments } from "@/hooks/useOwnerDocuments";
import {
  BOAT_HAS_RESERVATIONS,
  useCreateOwnerBoat,
  useDeleteOwnerBoat,
  usePublishOwnerBoat,
  useUnpublishOwnerBoat,
  useUpdateOwnerBoat,
} from "@/hooks/useOwnerMutations";
import { ownerHasRequiredPublishDocuments } from "@/queries/fetchOwnerDocuments";
import type { OwnerBoat } from "@/queries/fetchOwnerBoats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BoatFormValues = {
  name: string;
  type: (typeof Constants.public.Enums.boat_type)[number];
  portId: string;
  lengthM: string;
  widthM: string;
  draftM: string;
  capacity: string;
  motorization: string;
  skipperOption: (typeof Constants.public.Enums.boat_skipper_option)[number];
  pricePerDay: string;
  depositAmount: string;
  description: string;
};

export function OwnerBoatForm({ boat }: { boat?: OwnerBoat }) {
  const t = useTranslations("Pages.OwnerSpace");
  const router = useRouter();
  const { data: ports = [] } = usePorts();
  const { data: documents = [] } = useOwnerDocuments();
  const createBoat = useCreateOwnerBoat();
  const updateBoat = useUpdateOwnerBoat();
  const publishBoat = usePublishOwnerBoat();
  const unpublishBoat = useUnpublishOwnerBoat();
  const deleteBoat = useDeleteOwnerBoat();

  const schema = z.object({
    name: z.string().min(2, t("form_validation_name")),
    type: z.enum(Constants.public.Enums.boat_type),
    portId: z.string().uuid(t("form_validation_port")),
    lengthM: z.string().refine((value) => Number(value) > 0, t("form_validation_number")),
    widthM: z.string().refine((value) => Number(value) >= 0, t("form_validation_number")),
    draftM: z.string().refine((value) => Number(value) >= 0, t("form_validation_number")),
    capacity: z.string().refine((value) => Number(value) > 0, t("form_validation_number")),
    motorization: z.string(),
    skipperOption: z.enum(Constants.public.Enums.boat_skipper_option),
    pricePerDay: z.string().refine((value) => Number(value) >= 0, t("form_validation_number")),
    depositAmount: z.string().refine((value) => Number(value) >= 0, t("form_validation_number")),
    description: z.string(),
  });

  const form = useForm({
    defaultValues: {
      name: boat?.name ?? "",
      type: boat?.type ?? "SAILBOAT",
      portId: boat?.port_id ?? "",
      lengthM: boat ? String(boat.length_m) : "",
      widthM: boat ? String(boat.width_m) : "0",
      draftM: boat ? String(boat.draft_m) : "0",
      capacity: boat ? String(boat.capacity) : "",
      motorization: boat?.motorization ?? "",
      skipperOption: boat?.skipper_option ?? "NONE",
      pricePerDay: boat ? String(boat.price_per_day) : "",
      depositAmount: boat ? String(boat.deposit_amount) : "0",
      description: boat?.description ?? "",
    } satisfies BoatFormValues,
    //? Every field is checked against the whole schema, not just `name`. Before
    //? this, a missing port or a blank length left `canSubmit` true, `parse()`
    //? threw outside the try below, and the rejection went nowhere: the button
    //? did nothing and said nothing.
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value);

        if (result.success) {
          return undefined;
        }

        return {
          fields: Object.fromEntries(
            result.error.issues.map((issue) => [
              String(issue.path[0]),
              issue.message,
            ]),
          ),
        };
      },
    },
    onSubmit: async ({ value }) => {
      const validated = schema.parse(value);
      const payload = {
        name: validated.name,
        type: validated.type,
        port_id: validated.portId,
        length_m: Number(validated.lengthM),
        width_m: Number(validated.widthM),
        draft_m: Number(validated.draftM),
        capacity: Number(validated.capacity),
        motorization: validated.motorization || null,
        skipper_option: validated.skipperOption,
        price_per_day: Number(validated.pricePerDay),
        deposit_amount: Number(validated.depositAmount),
        description: validated.description || null,
      };

      try {
        if (boat) {
          await updateBoat.mutateAsync({ boatId: boat.id, updates: payload });
          toast.success(t("form_save_success"));
        } else {
          const created = await createBoat.mutateAsync(payload);
          toast.success(t("form_create_success"));
          router.push(`/owner/boats/${created.id}/edit`);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("form_save_error"),
        );
      }
    },
  });

  const canPublish = boat
    ? ownerHasRequiredPublishDocuments(documents, boat.id)
    : false;
  const isSubmitting =
    createBoat.isPending ||
    updateBoat.isPending ||
    publishBoat.isPending ||
    unpublishBoat.isPending ||
    deleteBoat.isPending;

  async function handleDelete() {
    if (!boat || !window.confirm(t("form_delete_confirm", { name: boat.name }))) {
      return;
    }

    try {
      await deleteBoat.mutateAsync(boat.id);
      toast.success(t("form_delete_success"));
      router.push("/owner/boats");
    } catch (error) {
      const hasReservations =
        error instanceof Error && error.message === BOAT_HAS_RESERVATIONS;

      toast.error(
        hasReservations
          ? t("form_delete_blocked")
          : error instanceof Error
            ? error.message
            : t("form_delete_error"),
      );
    }
  }

  async function handlePublishToggle() {
    if (!boat) {
      return;
    }

    try {
      if (boat.is_published) {
        await unpublishBoat.mutateAsync(boat.id);
        toast.success(t("form_unpublish_success"));
      } else {
        await publishBoat.mutateAsync(boat.id);
        toast.success(t("form_publish_success"));
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("form_publish_error"),
      );
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const result = schema.shape.name.safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_name_label")}
            >
              <Input
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_type_label")}
            >
              <Select
                onValueChange={(value) =>
                  field.handleChange(
                    value as BoatFormValues["type"],
                  )
                }
                value={field.state.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.boat_type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`type_${type.toLowerCase()}` as "type_sailboat")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="portId">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_port_label")}
            >
              <Select
                onValueChange={(value) => field.handleChange(value)}
                value={field.state.value || undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("form_port_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="skipperOption">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_skipper_label")}
            >
              <Select
                onValueChange={(value) =>
                  field.handleChange(
                    value as BoatFormValues["skipperOption"],
                  )
                }
                value={field.state.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.boat_skipper_option.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`skipper_${option.toLowerCase()}` as "skipper_none")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="lengthM">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_length_label")}
            >
              <Input
                inputMode="decimal"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="widthM">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_width_label")}
            >
              <Input
                inputMode="decimal"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="draftM">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_draft_label")}
            >
              <Input
                inputMode="decimal"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="capacity">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_capacity_label")}
            >
              <Input
                inputMode="numeric"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="motorization">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_motorization_label")}
            >
              <Input
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="pricePerDay">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_price_label")}
            >
              <Input
                inputMode="decimal"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="depositAmount">
          {(field) => (
            <Field
              error={field.state.meta.errors[0]}
              label={t("form_deposit_label")}
            >
              <Input
                inputMode="decimal"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field) => (
          <Field
              error={field.state.meta.errors[0]}
              label={t("form_description_label")}
            >
            <Textarea
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              rows={5}
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>

      {boat && !boat.is_published && !canPublish ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("form_publish_blocked")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          className="rounded-md bg-[#1a2b48] text-white hover:bg-[#243960]"
          disabled={isSubmitting}
          type="submit"
        >
          {boat ? t("form_save_cta") : t("form_create_cta")}
        </Button>

        {boat ? (
          <Button
            className="rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
            disabled={
              isSubmitting || (!boat.is_published && !canPublish)
            }
            onClick={() => {
              void handlePublishToggle();
            }}
            type="button"
          >
            {boat.is_published
              ? t("form_unpublish_cta")
              : t("form_publish_cta")}
          </Button>
        ) : null}

        {boat ? (
          <Button
            className="ml-auto rounded-md border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            disabled={isSubmitting}
            onClick={() => {
              void handleDelete();
            }}
            type="button"
            variant="outline"
          >
            <Trash2 aria-hidden className="size-4" />
            {t("form_delete_cta")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
