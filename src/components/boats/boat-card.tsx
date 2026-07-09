import { Star, Anchor } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BOAT_TYPE_GRADIENTS } from "@/lib/boats";
import { Database } from "@/lib/supabase/database.types";

type BoatType = Database["public"]["Enums"]["boat_type"];
type SkipperOption = Database["public"]["Enums"]["boat_skipper_option"];

export type BoatCardData = {
  id: string;
  name: string;
  type: BoatType;
  length_m: number;
  price_per_day: number;
  rating: number;
  badge: string | null;
  port_name: string;
  motorization: string | null;
  skipper_option: SkipperOption;
};

export function BoatCard({
  boat,
  locale,
  typeLabel,
  badgeLabel,
  unitLabel,
  skipperLabel,
  href,
}: {
  boat: BoatCardData;
  locale: string;
  typeLabel: string;
  badgeLabel?: string;
  unitLabel: string;
  skipperLabel?: string;
  href: string;
}) {
  const gradient = BOAT_TYPE_GRADIENTS[boat.type];
  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <Link
      className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      href={href}
    >
      <article>
        <div
          className={cn(
            "flex h-40 items-start bg-gradient-to-br p-3",
            gradient,
          )}
        >
          {badgeLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1a2b48] shadow-sm">
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#1a2b48]">{boat.name}</span>
            <span className="flex items-center gap-1 text-sm font-medium text-[#1a2b48]">
              <Star aria-hidden className="size-3.5 fill-[#c9866a] text-[#c9866a]" />
              {boat.rating.toLocaleString(locale)}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            {typeLabel} · {boat.length_m.toLocaleString(locale)} m · {boat.port_name}
          </p>
          {(boat.motorization || skipperLabel) ? (
            <p className="flex items-center gap-1 text-xs text-neutral-400">
              {boat.motorization ? (
                <span>{boat.motorization}</span>
              ) : null}
              {boat.motorization && skipperLabel ? (
                <span aria-hidden>·</span>
              ) : null}
              {skipperLabel ? (
                <span className="flex items-center gap-0.5">
                  <Anchor aria-hidden className="size-3" />
                  {skipperLabel}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className="mt-1">
            <span className="text-lg font-bold text-[#1a2b48]">
              {priceFormatter.format(boat.price_per_day)}
            </span>
            <span className="text-sm text-neutral-500"> / {unitLabel}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
