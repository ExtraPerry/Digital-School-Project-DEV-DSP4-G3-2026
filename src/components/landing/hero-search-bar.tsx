"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
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

export function HeroSearchBar({ ports }: { ports: string[] }) {
  const t = useTranslations("Pages.LandingPage");
  const router = useRouter();

  const [port, setPort] = useState(ports[0]);
  const [from, setFrom] = useState<Date | undefined>(() => new Date());
  const [to, setTo] = useState<Date | undefined>(() => inDays(6));
  const [type, setType] = useState<(typeof BOAT_TYPES)[number]>(
    BOAT_TYPES[0],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!from || !to) return;
    const params = new URLSearchParams({
      port,
      from: toISODate(from),
      to: toISODate(to),
      type,
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      className="flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-stretch sm:divide-x sm:divide-neutral-200"
      onSubmit={handleSubmit}
    >
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
          onChange={(event) => setPort(event.target.value)}
          value={port}
        >
          {ports.map((portOption) => (
            <option key={portOption} value={portOption}>
              {portOption}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
        <label
          className="text-xs font-medium uppercase tracking-wide text-neutral-400"
          htmlFor="search-from"
        >
          {t("search_from_label")}
        </label>
        <DatePicker
          disabled={to ? (date) => date > to : undefined}
          id="search-from"
          onChange={setFrom}
          value={from}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2 text-left">
        <label
          className="text-xs font-medium uppercase tracking-wide text-neutral-400"
          htmlFor="search-to"
        >
          {t("search_to_label")}
        </label>
        <DatePicker
          disabled={from ? (date) => date < from : undefined}
          id="search-to"
          onChange={setTo}
          value={to}
        />
      </div>

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
          onChange={(event) =>
            setType(event.target.value as (typeof BOAT_TYPES)[number])
          }
          value={type}
        >
          {BOAT_TYPES.map((typeOption) => (
            <option key={typeOption} value={typeOption}>
              {t(`search_type_${typeOption}`)}
            </option>
          ))}
        </select>
      </div>

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
