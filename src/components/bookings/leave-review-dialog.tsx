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
  reservationId: string;
};

export function LeaveReviewDialog({
  boatId,
  boatName,
  reservationId,
}: LeaveReviewDialogProps) {
  const t = useTranslations("Pages.BookingsPage");
  const { data: currentUser } = useCurrentUser();
  const createReview = useCreateBoatReview();
  const [open, setOpen] = useState(false);

  const reviewSchema = z.object({
    rating: z.number().min(1, t("review_validation_rating")).max(5),
    comment: z
      .string()
      .trim()
      .min(10, t("review_validation_comment_min"))
      .max(1000, t("review_validation_comment_max")),
  });

  const form = useForm({
    defaultValues: {
      rating: 5,
      comment: "",
    },
    onSubmit: async ({ value }) => {
      if (!currentUser) {
        toast.error(t("review_error"));
        return;
      }

      const validated = reviewSchema.parse(value);
      const authorName =
        [currentUser.first_name, currentUser.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || t("review_anonymous_author");

      try {
        await createReview.mutateAsync({
          boatId,
          reservationId,
          rating: validated.rating,
          comment: validated.comment,
          authorName,
          reviewerId: currentUser.id,
        });
        toast.success(t("review_success"));
        setOpen(false);
        form.reset();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("review_error"),
        );
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
          {t("review_cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("review_title")}</DialogTitle>
          <DialogDescription>
            {t("review_description", { boat: boatName })}
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
                <Label htmlFor={field.name}>{t("review_rating_label")}</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    const isActive = starValue <= field.state.value;

                    return (
                      <button
                        aria-label={t("review_rating_star", {
                          rating: starValue,
                        })}
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
                  <p className="text-sm text-red-600">
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
                <Label htmlFor={field.name}>{t("review_comment_label")}</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={t("review_comment_placeholder")}
                  rows={4}
                  value={field.state.value}
                />
                {field.state.meta.errors[0] ? (
                  <p className="text-sm text-red-600">
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
              {t("review_cancel")}
            </Button>
            <Button
              className="bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
              disabled={createReview.isPending}
              type="submit"
            >
              {createReview.isPending
                ? t("review_submitting")
                : t("review_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
