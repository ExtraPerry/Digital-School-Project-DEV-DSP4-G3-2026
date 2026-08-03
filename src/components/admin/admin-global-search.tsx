"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Ship, MessageSquareWarning, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useAdminGlobalSearch } from "@/hooks/useAdminGlobalSearch";
import type { AdminGlobalSearchEntity } from "@/queries/fetchAdminGlobalSearch";

const SEARCH_DEBOUNCE_MS = 300;

const ENTITY_ICONS: Record<
  AdminGlobalSearchEntity,
  typeof UserRound
> = {
  user: UserRound,
  boat: Ship,
  review: MessageSquareWarning,
};

const ENTITY_LABEL_KEYS: Record<AdminGlobalSearchEntity, string> = {
  user: "global_search_entity_user",
  boat: "global_search_entity_boat",
  review: "global_search_entity_review",
};

//? Where each hit sends the administrator. Users and reviews have no detail
//? route, so they land on the list screen that owns them.
const ENTITY_HREFS: Record<AdminGlobalSearchEntity, (id: string) => string> = {
  user: () => "/admin/users",
  boat: (id) => `/boats/${id}`,
  review: () => "/admin/moderation",
};

export function AdminGlobalSearch() {
  const t = useTranslations("Pages.AdminSpace");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: hits = [], isLoading } = useAdminGlobalSearch(query);

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(draft), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [draft]);

  //? Dismiss the panel on outside click and on Escape, so it never traps focus.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const showPanel = isOpen && query.trim().length >= 2;

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <label className="sr-only" htmlFor="admin-global-search">
        {t("global_search_label")}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
      />
      <Input
        aria-expanded={showPanel}
        className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/50"
        id="admin-global-search"
        onChange={(event) => {
          setDraft(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={t("global_search_placeholder")}
        role="combobox"
        type="search"
        value={draft}
      />

      {showPanel ? (
        <div
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
          role="listbox"
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-neutral-500">{t("loading")}</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-500">
              {t("global_search_empty")}
            </p>
          ) : (
            <ul>
              {hits.map((hit) => {
                const Icon = ENTITY_ICONS[hit.entityType];

                return (
                  <li key={`${hit.entityType}-${hit.entityId}`}>
                    <Link
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-[#f4f6f9]"
                      href={ENTITY_HREFS[hit.entityType](hit.entityId)}
                      onClick={() => setIsOpen(false)}
                      role="option"
                    >
                      <Icon
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-[#5b6b7c]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[#1a2b48]">
                          {hit.title || "—"}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          {t(ENTITY_LABEL_KEYS[hit.entityType])}
                          {hit.subtitle ? ` · ${hit.subtitle}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
