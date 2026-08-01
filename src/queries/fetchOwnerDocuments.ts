import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";

export type OwnerDocument =
  Database["public"]["Tables"]["boat_documents"]["Row"];

export type BoatDocumentType =
  Database["public"]["Enums"]["boat_document_type"];

export async function fetchOwnerDocuments(): Promise<OwnerDocument[]> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Failed to fetch owner documents: ${authError?.message ?? "not authenticated"}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Failed to fetch owner profile: ${profileError?.message ?? "missing profile"}`,
    );
  }

  const { data, error } = await supabase
    .from("boat_documents")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch owner documents: ${error.message}`);
  }

  return data ?? [];
}

export function ownerHasRequiredPublishDocuments(
  documents: OwnerDocument[],
  boatId: string,
): boolean {
  const hasLicense = documents.some(
    (document) =>
      document.document_type === "LICENSE" && document.boat_id === null,
  );
  const hasSailorCv = documents.some(
    (document) =>
      document.document_type === "SAILOR_CV" && document.boat_id === null,
  );
  const hasInsurance = documents.some(
    (document) =>
      document.document_type === "INSURANCE" && document.boat_id === boatId,
  );

  return hasLicense && hasSailorCv && hasInsurance;
}
