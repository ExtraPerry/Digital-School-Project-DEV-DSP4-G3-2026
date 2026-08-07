"use client";

import { useForm } from "@tanstack/react-form";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateBoatReview } from "@/hooks/useReviewMutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

type LeaveReviewDialogProps = {
  boatId: string;
  boatName: string;
  /**
   * The COMPLETED rental the review is attached to. `boat_reviews` accepts one
   * review per reservation and its RLS policy re-checks that the reservation is
   * the caller's own and finished, so this is not merely a UI hint.
   */
  reservationId: string;
  /** Lets a server-rendered host (the boat page) refresh what it printed. */
  onSuccess?: () => void;
};

/**
 * Post-rental review form, shared by the bookings list and the boat page.
 */
export function LeaveReviewDialog({
  boatId,
  boatName,
  reservationId,
  onSuccess,
}: LeaveReviewDialogProps) {
  const t = useTranslations("Common.Review");
  const { data: currentUser } = useCurrentUser();
  const createReview = useCreateBoatReview();
  const [open, setOpen] = useState(false);

  const reviewSchema = z.object({
    rating: z.number().min(1, t("validation_rating")).max(5),
    comment: z
      .string()
      .trim()
      .min(10, t("validation_comment_min"))
      .max(1000, t("validation_comment_max")),
  });

  const form = useForm({
    defaultValues: {
      rating: 5,
      comment: "",
    },
    onSubmit: async ({ value }) => {
      if (!currentUser) {
        toast.error(t("error"));
        return;
      }

      const validated = reviewSchema.parse(value);
      const authorName =
        [currentUser.first_name, currentUser.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || t("anonymous_author");

      try {
        await createReview.mutateAsync({
          boatId,
          reservationId,
          rating: validated.rating,
          comment: validated.comment,
          authorName,
          reviewerId: currentUser.id,
        });
        toast.success(t("success"));
        setOpen(false);
        form.reset();
        onSuccess?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("error"));
      }
    },
  });

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
          size="sm"
          type="button"
        >
          {t("cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { boat: boatName })}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="rating"
            validators={{
              onChange: ({ value }) => {
                const result = reviewSchema.shape.rating.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>{t("rating_label")}</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    const isActive = starValue <= field.state.value;

                    return (
                      <button
                        aria-label={t("rating_star", { rating: starValue })}
                        aria-pressed={isActive}
                        className="rounded p-0.5 text-[#c9866a] transition hover:scale-110"
                        key={starValue}
                        onClick={() => field.handleChange(starValue)}
                        type="button"
                      >
                        <Star
                          className={cn(
                            "size-6",
                            isActive ? "fill-current" : "fill-none",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                {field.state.meta.errors[0] ? (
                  <p className="text-sm text-red-600" role="alert">
                    {field.state.meta.errors[0]}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="comment"
            validators={{
              onChange: ({ value }) => {
                const result = reviewSchema.shape.comment.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>{t("comment_label")}</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={t("comment_placeholder")}
                  rows={4}
                  value={field.state.value}
                />
                {field.state.meta.errors[0] ? (
                  <p className="text-sm text-red-600" role="alert">
                    {field.state.meta.errors[0]}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              {t("cancel")}
            </Button>
            <Button
              className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
              disabled={createReview.isPending}
              type="submit"
            >
              {createReview.isPending ? t("submitting") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
