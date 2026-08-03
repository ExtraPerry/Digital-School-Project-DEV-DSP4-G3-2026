"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Pages.AdminSpace");

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t("pagination_label")}
      className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-4"
    >
      <Button
        className="h-8 border-neutral-200 text-[#1a2b48]"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        <ChevronLeft aria-hidden className="size-3.5" />
        {t("pagination_previous")}
      </Button>

      <p aria-live="polite" className="text-xs text-[#5b6b7c]">
        {t("pagination_position", { page, pageCount })}
      </p>

      <Button
        className="h-8 border-neutral-200 text-[#1a2b48]"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        {t("pagination_next")}
        <ChevronRight aria-hidden className="size-3.5" />
      </Button>
    </nav>
  );
}
