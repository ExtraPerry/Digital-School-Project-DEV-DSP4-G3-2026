import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Home › [boat types] › [port]. A criterion the visitor has not set produces no
 * crumb, so the neutral catalogue reads "Home › All boats" instead of trailing
 * an empty segment.
 */
export function SearchBreadcrumbs({
  port,
  typeLabel,
}: {
  port: string | null;
  typeLabel: string | null;
}) {
  const t = useTranslations("Pages.SearchPage");

  const crumbs = [typeLabel, port].filter(
    (crumb): crumb is string => Boolean(crumb),
  );

  return (
    <nav aria-label="Breadcrumb" className="px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 text-sm text-neutral-500">
        <Link className="transition-colors hover:text-[#1a2b48]" href="/">
          {t("breadcrumb_home")}
        </Link>
        {crumbs.length === 0 ? (
          <>
            <ChevronRight
              aria-hidden
              className="size-3.5 shrink-0 text-neutral-300"
            />
            <span className="font-medium text-[#1a2b48]">
              {t("breadcrumb_all_boats")}
            </span>
          </>
        ) : (
          crumbs.map((crumb, index) => (
            <Fragment key={crumb}>
              <ChevronRight
                aria-hidden
                className="size-3.5 shrink-0 text-neutral-300"
              />
              <span
                className={
                  index === crumbs.length - 1
                    ? "font-medium text-[#1a2b48]"
                    : "text-neutral-700"
                }
              >
                {crumb}
              </span>
            </Fragment>
          ))
        )}
      </div>
    </nav>
  );
}
