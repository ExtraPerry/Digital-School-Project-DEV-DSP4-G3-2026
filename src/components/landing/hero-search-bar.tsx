"use client";

import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Constants } from "@/lib/supabase/database.types";

const BOAT_TYPES = Constants.public.Enums.boat_type.map(
  (type) => type.toLowerCase() as Lowercase<typeof type>,
);

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type HeroSearchDefaultValues = {
  port?: string;
  from?: Date;
  to?: Date;
  type?: (typeof BOAT_TYPES)[number];
};

export function HeroSearchBar({
  ports,
  defaultValues,
}: {
  ports: string[];
  defaultValues?: HeroSearchDefaultValues;
}) {
  const t = useTranslations("Pages.LandingPage");
  const router = useRouter();

  const heroSearchSchema = z
    .object({
      port: z.string().min(1),
      from: z.date(),
      to: z.date(),
      type: z.enum(BOAT_TYPES as [string, ...string[]]),
    })
    .refine((data) => data.to >= data.from, {
      message: t("search_date_range_error"),
      path: ["to"],
    });

  const form = useForm({
    defaultValues: {
      port: defaultValues?.port ?? ports[0] ?? "",
      from: defaultValues?.from ?? new Date(),
      to: defaultValues?.to ?? inDays(6),
      type: defaultValues?.type ?? BOAT_TYPES[0],
    },
    onSubmit: ({ value }) => {
      const validated = heroSearchSchema.parse(value);
      const params = new URLSearchParams({
        port: validated.port,
        from: toISODate(validated.from),
        to: toISODate(validated.to),
        type: validated.type,
      });
      router.push(`/search?${params.toString()}`);
    },
  });

  return (
    <form
      className="flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-stretch sm:divide-x sm:divide-neutral-200"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="port">
        {(field) => (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
            <label
              className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              htmlFor="search-port"
            >
              {t("search_port_label")}
            </label>
            <select
              className="-ml-px w-full min-w-0 bg-transparent text-sm font-semibold text-[#1a2b48] outline-none"
              id="search-port"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              value={field.state.value}
            >
              {ports.map((portOption) => (
                <option key={portOption} value={portOption}>
                  {portOption}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="from">
        {(field) => (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
            <label
              className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              htmlFor="search-from"
            >
              {t("search_from_label")}
            </label>
            <DatePicker
              disabled={(date) => {
                const toValue = form.getFieldValue("to");
                return toValue instanceof Date ? date > toValue : false;
              }}
              id="search-from"
              onChange={(date) => date && field.handleChange(date)}
              value={field.state.value}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="to">
        {(field) => (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
            <label
              className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              htmlFor="search-to"
            >
              {t("search_to_label")}
            </label>
            <DatePicker
              disabled={(date) => {
                const fromValue = form.getFieldValue("from");
                return fromValue instanceof Date ? date < fromValue : false;
              }}
              id="search-to"
              onChange={(date) => date && field.handleChange(date)}
              value={field.state.value}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
            <label
              className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              htmlFor="search-type"
            >
              {t("search_type_label")}
            </label>
            <select
              className="-ml-px w-full min-w-0 bg-transparent text-sm font-semibold text-[#1a2b48] outline-none"
              id="search-type"
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(
                  event.target.value as (typeof BOAT_TYPES)[number],
                )
              }
              value={field.state.value}
            >
              {BOAT_TYPES.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {t(`search_type_${typeOption}`)}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <Button
        className="rounded-xl bg-[#D68A6E] px-6 text-white hover:bg-[#c57d5f] sm:h-auto"
        type="submit"
      >
        <Search aria-hidden className="size-4" />
        {t("search_submit")}
      </Button>
    </form>
  );
}
