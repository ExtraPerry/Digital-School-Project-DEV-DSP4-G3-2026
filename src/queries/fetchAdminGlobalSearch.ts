import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";

export type AdminGlobalSearchEntity = "user" | "boat" | "review";

export type AdminGlobalSearchHit = {
  entityType: AdminGlobalSearchEntity;
  entityId: string;
  title: string;
  subtitle: string;
};

//? Backs the "global search" field drawn in the approved admin wireframe.
//? The RPC is SECURITY DEFINER and raises 42501 for non-administrators.
export async function fetchAdminGlobalSearch(
  query: string,
): Promise<AdminGlobalSearchHit[]> {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return [];
  }

  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.rpc("admin_global_search", {
    p_query: trimmed,
  });

  if (error) {
    throw new Error(`Failed to run admin global search: ${error.message}`);
  }

  return (data ?? []).map((hit) => ({
    entityType: hit.entity_type as AdminGlobalSearchEntity,
    entityId: hit.entity_id,
    title: hit.title,
    subtitle: hit.subtitle,
  }));
}
