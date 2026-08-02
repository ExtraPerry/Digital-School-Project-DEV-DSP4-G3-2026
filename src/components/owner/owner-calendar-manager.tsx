"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { useOwnerBoats } from "@/hooks/useOwnerBoats";
import { useBoatAvailabilitySlots } from "@/hooks/useBoatAvailabilitySlots";
import {
  useCreateAvailabilitySlot,
  useDeleteAvailabilitySlot,
} from "@/hooks/useOwnerMutations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function OwnerCalendarManager() {
  const t = useTranslations("Pages.OwnerSpace");
  const locale = useLocale();
  const dateFnsLocale = locale === "fr" ? fr : enUS;
  const { data: boats = [], isLoading: boatsLoading } = useOwnerBoats();
  const [selectedBoatId, setSelectedBoatId] = useState<string>("");
  const activeBoatId = selectedBoatId || boats[0]?.id || null;
  const { data: slots = [], isLoading: slotsLoading } =
    useBoatAvailabilitySlots(activeBoatId);
  const createSlot = useCreateAvailabilitySlot();
  const deleteSlot = useDeleteAvailabilitySlot();
  const [range, setRange] = useState<DateRange | undefined>();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  const selectedSummary =
    range?.from && range.to
      ? `${dateFormatter.format(range.from)} → ${dateFormatter.format(range.to)}`
      : range?.from
        ? dateFormatter.format(range.from)
        : null;

  async function handleAddSlot() {
    if (!activeBoatId || !range?.from || !range.to) {
      toast.error(t("calendar_range_required"));
      return;
    }

    try {
      await createSlot.mutateAsync({
        boatId: activeBoatId,
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: format(range.to, "yyyy-MM-dd"),
      });
      setRange(undefined);
      toast.success(t("calendar_add_success"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("calendar_add_error"),
      );
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!activeBoatId) {
      return;
    }

    try {
      await deleteSlot.mutateAsync({ slotId, boatId: activeBoatId });
      toast.success(t("calendar_delete_success"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("calendar_delete_error"),
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="rounded-2xl border border-[#d7dee8] bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label className="mb-2 block text-sm font-medium text-[#1a2b48]">
                {t("calendar_boat_label")}
              </label>
              <Select
                disabled={boatsLoading || boats.length === 0}
                onValueChange={setSelectedBoatId}
                value={activeBoatId ?? undefined}
              >
                <SelectTrigger className="h-11 w-full border-[#cfd8e6] bg-[#f8fafc] text-[#1a2b48]">
                  <SelectValue placeholder={t("calendar_boat_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {boats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSummary ? (
              <p className="rounded-full bg-[#1a2b48]/8 px-4 py-2 text-sm font-medium text-[#1a2b48]">
                {selectedSummary}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                {t("calendar_range_hint")}
              </p>
            )}
          </div>

          <div className="flex justify-center rounded-2xl border border-[#e4ebf3] bg-[#f4f7fb] px-3 py-5 sm:px-6 sm:py-6">
            <Calendar
              buttonVariant="ghost"
              className={cn(
                "rounded-xl bg-transparent p-0 text-[#1a2b48]",
                "[--cell-size:2.75rem] sm:[--cell-size:3rem]",
              )}
              classNames={{
                root: "w-fit mx-auto",
                months: "relative flex flex-col gap-6 md:flex-row md:gap-8",
                month: "flex w-full flex-col gap-4",
                month_caption: "flex h-10 w-full items-center justify-center",
                caption_label: "text-base font-semibold text-[#1a2b48]",
                weekday: "flex-1 text-xs font-medium text-[#6b7c93]",
                button_previous:
                  "size-9 rounded-full text-[#1a2b48] hover:bg-[#1a2b48]/10",
                button_next:
                  "size-9 rounded-full text-[#1a2b48] hover:bg-[#1a2b48]/10",
                today: "rounded-md bg-[#1a2b48]/10 text-[#1a2b48] font-semibold",
                outside: "text-[#9aa8bc] opacity-60",
                range_start: "rounded-l-md bg-[#D68A6E]/25 after:bg-[#D68A6E]/25",
                range_middle: "bg-[#D68A6E]/20 text-[#1a2b48]",
                range_end: "rounded-r-md bg-[#D68A6E]/25 after:bg-[#D68A6E]/25",
              }}
              components={{
                DayButton: ({ className, modifiers, ...props }) => (
                  <Button
                    className={cn(
                      "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 text-sm font-medium text-[#1a2b48] hover:bg-[#1a2b48]/10 hover:text-[#1a2b48]",
                      modifiers.range_start &&
                        "rounded-l-md bg-[#D68A6E] text-white hover:bg-[#c57d5f] hover:text-white",
                      modifiers.range_end &&
                        "rounded-r-md bg-[#D68A6E] text-white hover:bg-[#c57d5f] hover:text-white",
                      modifiers.range_middle &&
                        "rounded-none bg-[#f3d5c8] text-[#1a2b48] hover:bg-[#eec4b2]",
                      modifiers.selected &&
                        !modifiers.range_start &&
                        !modifiers.range_end &&
                        !modifiers.range_middle &&
                        "bg-[#D68A6E] text-white hover:bg-[#c57d5f] hover:text-white",
                      className,
                    )}
                    size="icon"
                    type="button"
                    variant="ghost"
                    {...props}
                  />
                ),
              }}
              locale={dateFnsLocale}
              mode="range"
              numberOfMonths={1}
              onSelect={setRange}
              selected={range}
              showOutsideDays
            />
          </div>

          <Button
            className="mx-auto h-11 w-full max-w-sm rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
            disabled={!activeBoatId || createSlot.isPending}
            onClick={() => {
              void handleAddSlot();
            }}
            type="button"
          >
            {t("calendar_add_cta")}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d7dee8] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-[#1a2b48]">
          {t("calendar_slots_title")}
        </h2>

        {!activeBoatId ? (
          <p className="text-sm text-neutral-500">{t("calendar_no_boat")}</p>
        ) : slotsLoading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("calendar_slots_empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4ebf3] bg-[#f8fafc] px-4 py-3"
              >
                <p className="text-sm font-medium text-[#1a2b48]">
                  {dateFormatter.format(new Date(`${slot.start_date}T12:00:00`))}
                  {" → "}
                  {dateFormatter.format(new Date(`${slot.end_date}T12:00:00`))}
                </p>
                <Button
                  className="border-[#cfd8e6] text-[#1a2b48] hover:bg-[#1a2b48]/5"
                  disabled={deleteSlot.isPending}
                  onClick={() => {
                    void handleDeleteSlot(slot.id);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("calendar_delete_cta")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
