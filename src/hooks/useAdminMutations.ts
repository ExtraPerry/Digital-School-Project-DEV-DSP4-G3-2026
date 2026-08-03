"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import { ADMIN_USERS_QUERY_KEY_PREFIX } from "@/hooks/useAdminUsers";
import { ADMIN_BOATS_QUERY_KEY_PREFIX } from "@/hooks/useAdminBoats";
import { ADMIN_STATS_QUERY_KEY_PREFIX } from "@/hooks/useAdminPlatformStats";
import { ADMIN_AUDIT_QUERY_KEY_PREFIX } from "@/hooks/useAdminAuditLog";
import { ADMIN_REVIEWS_QUERY_KEY_PREFIX } from "@/hooks/useAdminReviews";
import { ADMIN_PAYMENT_TOTALS_QUERY_KEY_PREFIX } from "@/hooks/useAdminPaymentTotals";
import { ADMIN_FLAGGED_REVIEWS_QUERY_KEY_PREFIX } from "@/hooks/useAdminFlaggedReviewCount";
import { BOATS_LIST_QUERY_KEY_PREFIX } from "@/hooks/useBoats";

type UserRoleType = Database["public"]["Enums"]["user_roles_type"];
type UserAccountStatus = Database["public"]["Enums"]["user_account_status"];
type ReviewModerationStatus =
  Database["public"]["Enums"]["review_moderation_status"];

//? The RPCs raise bare sentinel codes so the UI can translate them.
//? Anything else is an unexpected failure and falls back to a generic message.
export type AdminMutationErrorKey =
  | "admin_error_role_precondition_contact"
  | "admin_error_self_change"
  | "admin_error_user_not_found"
  | "admin_error_review_not_found"
  | "admin_error_boat_not_found"
  | "admin_error_publish_requirements"
  | "admin_error_forbidden"
  | "admin_error_generic";

export function mapAdminMutationError(message: string): AdminMutationErrorKey {
  if (message.includes("ADMIN_ROLE_PRECONDITION_CONTACT")) {
    return "admin_error_role_precondition_contact";
  }

  if (
    message.includes("ADMIN_ROLE_SELF_CHANGE") ||
    message.includes("ADMIN_STATUS_SELF_CHANGE")
  ) {
    return "admin_error_self_change";
  }

  if (message.includes("ADMIN_USER_NOT_FOUND")) {
    return "admin_error_user_not_found";
  }

  if (message.includes("ADMIN_REVIEW_NOT_FOUND")) {
    return "admin_error_review_not_found";
  }

  if (message.includes("ADMIN_BOAT_NOT_FOUND")) {
    return "admin_error_boat_not_found";
  }

  //? Raised by enforce_boat_publish_requirements() when an administrator tries
  //? to republish a listing whose owner is missing a required document.
  if (
    message.includes("LICENSE") ||
    message.includes("SAILOR_CV") ||
    message.includes("INSURANCE")
  ) {
    return "admin_error_publish_requirements";
  }

  if (message.includes("Only administrators")) {
    return "admin_error_forbidden";
  }

  return "admin_error_generic";
}

//? Realtime invalidation covers users/user_roles/boats/admin_audit_log, but we
//? still invalidate in onSuccess so the acting administrator's own UI updates
//? immediately rather than on the next broadcast round-trip.
function useInvalidateAdminCaches() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all(
      [
        ADMIN_USERS_QUERY_KEY_PREFIX,
        ADMIN_BOATS_QUERY_KEY_PREFIX,
        ADMIN_STATS_QUERY_KEY_PREFIX,
        ADMIN_AUDIT_QUERY_KEY_PREFIX,
        ADMIN_REVIEWS_QUERY_KEY_PREFIX,
        ADMIN_PAYMENT_TOTALS_QUERY_KEY_PREFIX,
        ADMIN_FLAGGED_REVIEWS_QUERY_KEY_PREFIX,
        BOATS_LIST_QUERY_KEY_PREFIX,
      ].map((prefix) =>
        queryClient.invalidateQueries({ queryKey: [prefix] }),
      ),
    );
  };
}

export function useAdminSetUserRole() {
  const invalidateAdminCaches = useInvalidateAdminCaches();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRoleType;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("admin_set_user_role", {
        p_user_id: userId,
        p_role: role,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to set user role");
      }

      return data;
    },
    onSuccess: invalidateAdminCaches,
  });
}

export function useAdminSetUserStatus() {
  const invalidateAdminCaches = useInvalidateAdminCaches();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: UserAccountStatus;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("admin_set_user_status", {
        p_user_id: userId,
        p_status: status,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to set account status");
      }

      return data;
    },
    onSuccess: invalidateAdminCaches,
  });
}

export function useAdminModerateReview() {
  const invalidateAdminCaches = useInvalidateAdminCaches();

  return useMutation({
    mutationFn: async ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: ReviewModerationStatus;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("admin_moderate_review", {
        p_review_id: reviewId,
        p_status: status,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to moderate review");
      }

      return data;
    },
    onSuccess: invalidateAdminCaches,
  });
}

export function useAdminSetBoatPublished() {
  const invalidateAdminCaches = useInvalidateAdminCaches();

  return useMutation({
    mutationFn: async ({
      boatId,
      isPublished,
    }: {
      boatId: string;
      isPublished: boolean;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("admin_set_boat_published", {
        p_boat_id: boatId,
        p_is_published: isPublished,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to update listing");
      }

      return data;
    },
    onSuccess: invalidateAdminCaches,
  });
}
