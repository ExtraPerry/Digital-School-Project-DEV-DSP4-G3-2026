"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarX, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
import { parseISODate, toISODate, toLocalMidnight } from "@/lib/dates";
import { Constants } from "@/lib/supabase/database.types";
import type { BoatSearchFilters, BoatType } from "@/queries/fetchBoats";

const ALL_BOAT_TYPES = Constants.public.Enums.boat_type as readonly BoatType[];

/**
 * Radix Select has no empty-string value, so "no port" needs a sentinel. It is
 * mapped back to `null` on submit and never reaches the URL.
 */
const ANY_PORT_VALUE = "__ANY_PORT__";

type SearchCriteriaFormProps = {
  filters: BoatSearchFilters;
  ports: string[];
  onApply: (updates: Partial<BoatSearchFilters>) => void;
  onCancel: () => void;
};

function SearchCriteriaForm({
  filters,
  ports,
  onApply,
  onCancel,
}: SearchCriteriaFormProps) {
  const t = useTranslations("Pages.SearchPage");
  const tLanding = useTranslations("Pages.LandingPage");

  //? Every criterion is optional — clearing all three is how a visitor returns
  //? to the neutral catalogue — so the schema normalises rather than requires.
  const criteriaSchema = z
    .object({
      port: z.string(),
      from: z.date().optional(),
      to: z.date().optional(),
      types: z.array(z.enum(ALL_BOAT_TYPES)),
    })
    .refine((value) => !value.from || !value.to || value.to >= value.from, {
      message: tLanding("search_date_range_error"),
      path: ["to"],
    });

  const form = useForm({
    defaultValues: {
      port: filters.port ?? ANY_PORT_VALUE,
      from: filters.from ? parseISODate(filters.from) : undefined,
      to: filters.to ? parseISODate(filters.to) : undefined,
      types: filters.types ?? [],
    },
    onSubmit: ({ value }) => {
      const validated = criteriaSchema.parse(value);
      //? A lone bound cannot describe a rental window, so a half-filled range
      //? applies as no range at all rather than as a silent guess.
      const rentalWindow =
        validated.from && validated.to
          ? { from: toISODate(validated.from), to: toISODate(validated.to) }
          : { from: null, to: null };

      onApply({
        port: validated.port === ANY_PORT_VALUE ? null : validated.port,
        ...rentalWindow,
        types: validated.types.length > 0 ? validated.types : undefined,
        page: 1,
      });
    },
  });

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-5">
        <form.Field name="port">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label
                className="text-xs font-medium uppercase tracking-wide text-neutral-500"
                htmlFor="criteria-port"
              >
                {tLanding("search_port_label")}
              </Label>
              <Select
                onValueChange={field.handleChange}
                value={field.state.value}
              >
                <SelectTrigger
                  className="h-11 w-full rounded-xl border-neutral-200 text-sm font-medium text-[#1a2b48]"
                  id="criteria-port"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_PORT_VALUE}>
                    {t("criteria_all_ports")}
                  </SelectItem>
                  {ports.map((portOption) => (
                    <SelectItem key={portOption} value={portOption}>
                      {portOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {t("criteria_dates_label")}
            </span>
            <form.Subscribe
              selector={(state) => Boolean(state.values.from || state.values.to)}
            >
              {(hasDates) =>
                hasDates ? (
                  <Button
                    className="h-auto gap-1.5 p-0 text-xs font-medium text-[#1a2b48] hover:bg-transparent hover:underline"
                    onClick={() => {
                      form.setFieldValue("from", undefined);
                      form.setFieldValue("to", undefined);
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <CalendarX aria-hidden className="size-3.5" />
                    {t("criteria_dates_clear")}
                  </Button>
                ) : null
              }
            </form.Subscribe>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <form.Field name="from">
              {(field) => (
                <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-neutral-200 px-3 py-2">
                  <Label
                    className="text-xs font-medium text-neutral-400"
                    htmlFor="criteria-from"
                  >
                    {tLanding("search_from_label")}
                  </Label>
                  <DatePicker
                    className="w-full"
                    disabled={(date) => {
                      const toValue = form.getFieldValue("to");
                      return toValue
                        ? toLocalMidnight(date) > toLocalMidnight(toValue)
                        : false;
                    }}
                    id="criteria-from"
                    onChange={field.handleChange}
                    placeholder={t("criteria_any_date")}
                    value={field.state.value}
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="to"
              validators={{
                onChangeListenTo: ["from"],
                onChange: ({ value, fieldApi }) => {
                  const fromValue = fieldApi.form.getFieldValue("from");

                  if (!value || !fromValue || value >= fromValue) {
                    return undefined;
                  }

                  return tLanding("search_date_range_error");
                },
              }}
            >
              {(field) => (
                <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-neutral-200 px-3 py-2">
                  <Label
                    className="text-xs font-medium text-neutral-400"
                    htmlFor="criteria-to"
                  >
                    {tLanding("search_to_label")}
                  </Label>
                  <DatePicker
                    className="w-full"
                    disabled={(date) => {
                      const fromValue = form.getFieldValue("from");
                      return fromValue
                        ? toLocalMidnight(date) < toLocalMidnight(fromValue)
                        : false;
                    }}
                    id="criteria-to"
                    onChange={field.handleChange}
                    placeholder={t("criteria_any_date")}
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-xs text-red-600" role="alert">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <form.Field name="types">
          {(field) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {tLanding("search_type_label")}
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ALL_BOAT_TYPES.map((boatType) => {
                  const isChecked = field.state.value.includes(boatType);

                  return (
                    <label
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-[#1a2b48] transition-colors hover:bg-neutral-50 has-data-checked:border-[#D68A6E] has-data-checked:bg-[#D68A6E]/5"
                      key={boatType}
                    >
                      <Checkbox
                        checked={isChecked}
                        className="data-checked:border-[#D68A6E] data-checked:bg-[#D68A6E]"
                        onCheckedChange={() =>
                          field.handleChange(
                            isChecked
                              ? field.state.value.filter(
                                  (value) => value !== boatType,
                                )
                              : [...field.state.value, boatType],
                          )
                        }
                      />
                      {tLanding(`search_type_${boatType.toLowerCase()}`)}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-400">
                {t("criteria_types_hint")}
              </p>
            </fieldset>
          )}
        </form.Field>
      </div>

      <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-neutral-200 bg-[#f7f8fa] p-4">
        <Button
          className="border-neutral-200 text-[#1a2b48]"
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          {t("criteria_cancel")}
        </Button>
        <Button
          className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          type="submit"
        >
          {t("filters_apply")}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Edits the three headline criteria shown in the summary bar — port, rental
 * window and boat types — and leaves every other filter (price, length,
 * equipment, skipper, sort) exactly as the sidebar set them.
 *
 * The form lives in a child mounted inside the dialog content, so Radix
 * unmounting it on close is what re-seeds the fields from the URL: a half-typed
 * draft never survives a cancel, and the next open always reflects the criteria
 * actually in effect.
 */
export function SearchCriteriaDialog({
  filters,
  ports,
  onApply,
}: {
  filters: BoatSearchFilters;
  ports: string[];
  onApply: (updates: Partial<BoatSearchFilters>) => void;
}) {
  const t = useTranslations("Pages.SearchPage");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="shrink-0 gap-1.5 rounded-lg bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          size="sm"
          type="button"
        >
          <Pencil aria-hidden className="size-3.5" />
          {t("modify_button")}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 p-5 pb-4 pr-12">
          <DialogTitle className="text-lg font-semibold text-[#1a2b48]">
            {t("modify_title")}
          </DialogTitle>
          <DialogDescription>{t("modify_description")}</DialogDescription>
        </DialogHeader>

        <SearchCriteriaForm
          filters={filters}
          onApply={(updates) => {
            onApply(updates);
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
          ports={ports}
        />
      </DialogContent>
    </Dialog>
  );
}
