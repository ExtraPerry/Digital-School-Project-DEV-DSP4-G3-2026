import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SearchBreadcrumbs({
  port,
  typeLabel,
}: {
  port: string;
  typeLabel: string;
}) {
  const t = useTranslations("Pages.SearchPage");

  return (
    <nav aria-label="Breadcrumb" className="px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-1.5 text-sm text-neutral-500">
        <Link
          className="transition-colors hover:text-[#1a2b48]"
          href="/"
        >
          {t("breadcrumb_home")}
        </Link>
        <ChevronRight aria-hidden className="size-3.5 shrink-0 text-neutral-300" />
        <span className="text-neutral-700">{typeLabel}</span>
        <ChevronRight aria-hidden className="size-3.5 shrink-0 text-neutral-300" />
        <span className="font-medium text-[#1a2b48]">{port}</span>
      </div>
    </nav>
  );
}
