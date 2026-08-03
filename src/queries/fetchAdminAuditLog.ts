import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

type AuditRow = Database["public"]["Tables"]["admin_audit_log"]["Row"];

export type AdminAuditEntry = Pick<
  AuditRow,
  | "id"
  | "created_at"
  | "action"
  | "target_table"
  | "target_id"
  | "details"
  | "actor_email_snapshot"
> & {
  actorName: string | null;
};

//? The table is admin-SELECT-only and has no INSERT/UPDATE/DELETE policy or
//? grant at all: rows are written exclusively by SECURITY DEFINER RPCs.
export async function fetchAdminAuditLog(): Promise<AdminAuditEntry[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("admin_audit_log")
    .select(
      "id, created_at, action, target_table, target_id, details, actor_email_snapshot, users(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to fetch admin audit log: ${error.message}`);
  }

  return (data ?? []).map((entry) => {
    const actor = entry.users;
    const actorName = actor
      ? [actor.first_name, actor.last_name].filter(Boolean).join(" ").trim()
      : "";

    return {
      id: entry.id,
      created_at: entry.created_at,
      action: entry.action,
      target_table: entry.target_table,
      target_id: entry.target_id,
      details: entry.details,
      actor_email_snapshot: entry.actor_email_snapshot,
      actorName: actorName.length > 0 ? actorName : null,
    };
  });
}
