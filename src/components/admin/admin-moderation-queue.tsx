"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Info, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import {
  mapAdminMutationError,
  useAdminModerateReview,
} from "@/hooks/useAdminMutations";
import { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type ModerationStatus = Database["public"]["Enums"]["review_moderation_status"];

const STATUS_LABEL_KEYS: Record<ModerationStatus, string> = {
  APPROVED: "moderation_status_approved",
  FLAGGED: "moderation_status_flagged",
  REJECTED: "moderation_status_rejected",
};

const STATUS_BADGE_CLASSES: Record<ModerationStatus, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  FLAGGED: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
};

const FILTERS = [
  { value: "ALL", labelKey: "moderation_filter_all" },
  { value: "APPROVED", labelKey: "moderation_filter_approved" },
  { value: "FLAGGED", labelKey: "moderation_filter_flagged" },
  { value: "REJECTED", labelKey: "moderation_filter_rejected" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function AdminModerationQueue({ limit }: { limit?: number }) {
  const t = useTranslations("Pages.AdminSpace");
  const locale = useLocale();
  const { data: reviews = [], isLoading, isError } = useAdminReviews();
  const moderateReview = useAdminModerateReview();
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const filtered = useMemo(() => {
    const matching =
      filter === "ALL"
        ? reviews
        : reviews.filter((review) => review.moderation_status === filter);

    return limit ? matching.slice(0, limit) : matching;
  }, [reviews, filter, limit]);

  async function moderate(reviewId: string, status: ModerationStatus) {
    try {
      await moderateReview.mutateAsync({ reviewId, status });
      toast.success(t("toast_review_moderated"));
    } catch (error) {
      toast.error(
        t(mapAdminMutationError(error instanceof Error ? error.message : "")),
      );
    }
  }

  if (isError) {
    return <p className="text-sm text-neutral-500">{t("error_load")}</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">{t("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {limit ? null : (
        <>
          <p className="flex items-start gap-2 rounded-lg bg-[#eef1f6] px-4 py-3 text-xs text-[#5b6b7c]">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {t("moderation_intro")}
          </p>

          <div
            aria-label={t("moderation_filter_group_label")}
            className="flex flex-wrap gap-2"
            role="group"
          >
            {FILTERS.map((option) => (
              <Button
                key={option.value}
                aria-pressed={filter === option.value}
                className={cn(
                  "h-8 rounded-full border-neutral-200",
                  filter === option.value
                    ? "bg-[#1a2b48] text-white hover:bg-[#1a2b48]"
                    : "text-[#1a2b48]",
                )}
                onClick={() => setFilter(option.value)}
                size="sm"
                type="button"
                variant={filter === option.value ? "default" : "outline"}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {reviews.length === 0 ? t("empty") : t("moderation_empty_filtered")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((review) => (
            <li
              key={review.id}
              className={cn(
                "rounded-xl border p-4",
                review.moderation_status === "FLAGGED"
                  ? "border-amber-200 bg-amber-50/60"
                  : review.moderation_status === "REJECTED"
                    ? "border-neutral-200 bg-neutral-50"
                    : "border-neutral-200 bg-white",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-[#1a2b48]">
                      {review.reviewerName ?? review.author_name}
                    </span>{" "}
                    <span className="text-neutral-500">
                      {t("moderation_on_boat", {
                        boat: review.boatName ?? "—",
                      })}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <Star
                      aria-hidden
                      className="size-3 fill-[#D68A6E] text-[#D68A6E]"
                    />
                    <span
                      aria-label={t("moderation_rating_label", {
                        rating: Number(review.rating).toFixed(1),
                      })}
                    >
                      {Number(review.rating).toFixed(1)}
                    </span>
                    <span aria-hidden>·</span>
                    {dateFormatter.format(new Date(review.created_at))}
                  </p>
                </div>
                <Badge
                  className={STATUS_BADGE_CLASSES[review.moderation_status]}
                >
                  {t(STATUS_LABEL_KEYS[review.moderation_status])}
                </Badge>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {review.comment}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                {review.boatId ? (
                  <Button
                    asChild
                    className="h-8 text-[#1a2b48]"
                    size="sm"
                    variant="ghost"
                  >
                    <Link href={`/boats/${review.boatId}`}>
                      {t("moderation_action_investigate")}
                    </Link>
                  </Button>
                ) : null}
                {review.moderation_status !== "FLAGGED" ? (
                  <Button
                    className="h-8 border-neutral-200 text-[#1a2b48]"
                    disabled={moderateReview.isPending}
                    onClick={() => void moderate(review.id, "FLAGGED")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {t("moderation_action_flag")}
                  </Button>
                ) : null}
                {review.moderation_status !== "APPROVED" ? (
                  <Button
                    className="h-8 bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
                    disabled={moderateReview.isPending}
                    onClick={() => void moderate(review.id, "APPROVED")}
                    size="sm"
                    type="button"
                  >
                    {t("moderation_action_approve")}
                  </Button>
                ) : null}
                {review.moderation_status !== "REJECTED" ? (
                  <Button
                    className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    disabled={moderateReview.isPending}
                    onClick={() => void moderate(review.id, "REJECTED")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {t("moderation_action_reject")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
