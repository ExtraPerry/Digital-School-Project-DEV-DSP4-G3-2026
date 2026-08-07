"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Constants } from "@/lib/supabase/database.types";
import type { BoatEquipment, BoatSearchFilters, BoatType } from "@/queries/fetchBoats";
import type { BoatFilterBounds } from "@/queries/fetchBoats";

const ALL_BOAT_TYPES = Constants.public.Enums.boat_type as readonly BoatType[];
const ALL_EQUIPMENT = Constants.public.Enums.boat_equipment as readonly BoatEquipment[];

export function SearchFilters({
  filters,
  bounds,
  onApply,
}: {
  filters: BoatSearchFilters;
  bounds: BoatFilterBounds;
  onApply: (partial: Partial<BoatSearchFilters>) => void;
}) {
  const t = useTranslations("Pages.SearchPage");
  const tLanding = useTranslations("Pages.LandingPage");

  const form = useForm({
    defaultValues: {
      types: (filters.types ?? []) as BoatType[],
      skipperIncluded: filters.skipperIncluded ?? false,
      priceRange: [
        filters.minPrice ?? bounds.minPrice,
        filters.maxPrice ?? bounds.maxPrice,
      ],
      lengthRange: [
        filters.minLength ?? bounds.minLength,
        filters.maxLength ?? bounds.maxLength,
      ],
      equipment: (filters.equipment ?? []) as BoatEquipment[],
    },
    onSubmit: ({ value }) => {
      onApply({
        types: value.types.length > 0 ? value.types : undefined,
        skipperIncluded: value.skipperIncluded || undefined,
        minPrice:
          value.priceRange[0] > bounds.minPrice
            ? value.priceRange[0]
            : undefined,
        maxPrice:
          value.priceRange[1] < bounds.maxPrice
            ? value.priceRange[1]
            : undefined,
        minLength:
          value.lengthRange[0] > bounds.minLength
            ? value.lengthRange[0]
            : undefined,
        maxLength:
          value.lengthRange[1] < bounds.maxLength
            ? value.lengthRange[1]
            : undefined,
        equipment: value.equipment.length > 0 ? value.equipment : undefined,
        page: 1,
      });
    },
  });

  return (
    <aside className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:w-72 lg:shrink-0">
      <h2 className="mb-4 text-base font-semibold text-[#1a2b48]">
        {t("filters_title")}
      </h2>

      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {/* Type de bateau */}
        <form.Field name="types">
          {(field) => (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-[#1a2b48]">
                {t("filters_boat_type")}
              </p>
              <div className="flex flex-col gap-1.5">
                {ALL_BOAT_TYPES.map((boatType) => {
                  const isChecked = field.state.value.includes(boatType);
                  return (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                      key={boatType}
                    >
                      <input
                        checked={isChecked}
                        className="accent-[#D68A6E]"
                        onChange={() => {
                          const next = isChecked
                            ? field.state.value.filter((t) => t !== boatType)
                            : [...field.state.value, boatType];
                          field.handleChange(next);
                        }}
                        type="checkbox"
                      />
                      {tLanding(`search_type_${boatType.toLowerCase()}`)}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </form.Field>

        {/* Prix / jour */}
        <form.Field name="priceRange">
          {(field) => (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#1a2b48]">
                  {t("filters_price_label")}
                </p>
                <span className="text-xs text-neutral-500">
                  {t("filters_price_range", {
                    min: Math.round(field.state.value[0]),
                    max: Math.round(field.state.value[1]),
                  })}
                </span>
              </div>
              <Slider
                max={bounds.maxPrice}
                min={bounds.minPrice}
                onValueChange={(values) =>
                  field.handleChange([values[0], values[1]] as [number, number])
                }
                step={10}
                value={field.state.value}
              />
            </div>
          )}
        </form.Field>

        {/* Longueur */}
        <form.Field name="lengthRange">
          {(field) => (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#1a2b48]">
                  {t("filters_length_label")}
                </p>
                <span className="text-xs text-neutral-500">
                  {t("filters_length_range", {
                    min: field.state.value[0].toFixed(1),
                    max: field.state.value[1].toFixed(1),
                  })}
                </span>
              </div>
              <Slider
                max={bounds.maxLength}
                min={bounds.minLength}
                onValueChange={(values) =>
                  field.handleChange([values[0], values[1]] as [number, number])
                }
                step={0.5}
                value={field.state.value}
              />
            </div>
          )}
        </form.Field>

        {/* Équipements */}
        <form.Field name="equipment">
          {(field) => (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-[#1a2b48]">
                {t("filters_equipment")}
              </p>
              <div className="flex flex-col gap-1.5">
                {ALL_EQUIPMENT.map((item) => {
                  const isChecked = field.state.value.includes(item);
                  return (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                      key={item}
                    >
                      <input
                        checked={isChecked}
                        className="accent-[#D68A6E]"
                        onChange={() => {
                          const next = isChecked
                            ? field.state.value.filter((e) => e !== item)
                            : [...field.state.value, item];
                          field.handleChange(next);
                        }}
                        type="checkbox"
                      />
                      {t(`equipment_${item}`)}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </form.Field>

        {/* Avec skipper */}
        <form.Field name="skipperIncluded">
          {(field) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
              <input
                checked={field.state.value}
                className="accent-[#D68A6E]"
                onChange={(event) => field.handleChange(event.target.checked)}
                type="checkbox"
              />
              {t("filters_skipper")}
            </label>
          )}
        </form.Field>

        <Button
          className="w-full rounded-xl bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          type="submit"
        >
          {t("filters_apply")}
        </Button>
      </form>
    </aside>
  );
}
