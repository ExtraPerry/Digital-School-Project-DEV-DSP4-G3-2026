import { Database } from "@/lib/supabase/database.types";

type UserRoleType = Database["public"]["Enums"]["user_roles_type"];
type BoatType = Database["public"]["Enums"]["boat_type"];
type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

//? Enum value -> Pages.AdminSpace translation key. Keyed Records rather than
//? string interpolation so TypeScript fails the build when an enum gains a
//? member and its label is missing.
export const USER_ROLE_LABEL_KEYS: Record<UserRoleType, string> = {
  VISITOR: "role_visitor",
  RENTER: "role_renter",
  OWNER: "role_owner",
  ADMINISTRATOR: "role_administrator",
};

export const BOAT_TYPE_LABEL_KEYS: Record<BoatType, string> = {
  SAILBOAT: "type_sailboat",
  MOTORBOAT: "type_motorboat",
  CATAMARAN: "type_catamaran",
  YACHT: "type_yacht",
};

export const RESERVATION_STATUS_LABEL_KEYS: Record<ReservationStatus, string> = {
  PENDING: "reservation_status_pending",
  CONFIRMED: "reservation_status_confirmed",
  CANCELLED: "reservation_status_cancelled",
  COMPLETED: "reservation_status_completed",
};

export const RESERVATION_STATUS_BADGE_CLASSES: Record<
  ReservationStatus,
  string
> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  CONFIRMED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  CANCELLED: "bg-neutral-200 text-neutral-700 hover:bg-neutral-200",
  COMPLETED: "bg-sky-100 text-sky-800 hover:bg-sky-100",
};

//! payment_transactions.status is a plain text column, not an enum, so an
//! unrecognised value is possible. Callers must fall back to
//! "payment_status_unknown" and never render the raw database string.
const PAYMENT_STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: "payment_status_pending",
  PAID: "payment_status_paid",
  EXPIRED: "payment_status_expired",
};

export function paymentStatusLabelKey(status: string | null): string {
  if (!status) {
    return "payment_status_unknown";
  }

  return PAYMENT_STATUS_LABEL_KEYS[status] ?? "payment_status_unknown";
}

export const PAYMENT_STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  PAID: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  EXPIRED: "bg-neutral-200 text-neutral-700 hover:bg-neutral-200",
};
