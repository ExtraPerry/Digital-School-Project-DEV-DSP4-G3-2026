"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/createSupabaseBrowserClient";
import { Database } from "@/lib/supabase/database.types";
import { OWNER_BOATS_QUERY_KEY } from "@/hooks/useOwnerBoats";
import { OWNER_DOCUMENTS_QUERY_KEY } from "@/hooks/useOwnerDocuments";
import {
  OWNER_AVAILABILITY_QUERY_KEY,
  buildBoatAvailabilityQueryKey,
} from "@/hooks/useBoatAvailabilitySlots";
import { CURRENT_USER_ROLE_QUERY_KEY } from "@/hooks/useCurrentUserRole";

type BoatInsert = Database["public"]["Tables"]["boats"]["Insert"];
type BoatUpdate = Database["public"]["Tables"]["boats"]["Update"];
type BoatDocumentType = Database["public"]["Enums"]["boat_document_type"];

async function getCurrentOwnerProfileId(): Promise<{
  authId: string;
  ownerId: string;
}> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message ?? "Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Owner profile not found");
  }

  return { authId: user.id, ownerId: profile.id };
}

export function useUpgradeToOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc(
        "upgrade_current_user_to_owner",
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_ROLE_QUERY_KEY,
      });
    },
  });
}

export function useCreateOwnerBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      boatInput: Omit<BoatInsert, "owner_id" | "is_published">,
    ) => {
      const { ownerId } = await getCurrentOwnerProfileId();
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boats")
        .insert({
          ...boatInput,
          owner_id: ownerId,
          is_published: false,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to create boat");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OWNER_BOATS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["owner-boat"] });
    },
  });
}

export function useUpdateOwnerBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boatId,
      updates,
    }: {
      boatId: string;
      updates: BoatUpdate;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boats")
        .update(updates)
        .eq("id", boatId)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to update boat");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OWNER_BOATS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["owner-boat"] });
    },
  });
}

export function usePublishOwnerBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boatId: string) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boats")
        .update({ is_published: true })
        .eq("id", boatId)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to publish boat");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OWNER_BOATS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["owner-boat"] });
    },
  });
}

export function useUnpublishOwnerBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boatId: string) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boats")
        .update({ is_published: false })
        .eq("id", boatId)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to unpublish boat");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OWNER_BOATS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["owner-boat"] });
    },
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boatId,
      startDate,
      endDate,
    }: {
      boatId: string;
      startDate: string;
      endDate: string;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("boat_availability_time_slots")
        .insert({
          boat_id: boatId,
          start_date: startDate,
          end_date: endDate,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to create availability slot");
      }

      return data;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: OWNER_AVAILABILITY_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: buildBoatAvailabilityQueryKey(variables.boatId),
        }),
      ]);
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slotId,
      boatId,
    }: {
      slotId: string;
      boatId: string;
    }) => {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from("boat_availability_time_slots")
        .delete()
        .eq("id", slotId);

      if (error) {
        throw new Error(error.message);
      }

      return { slotId, boatId };
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: OWNER_AVAILABILITY_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: buildBoatAvailabilityQueryKey(variables.boatId),
        }),
      ]);
    },
  });
}

export function useUploadOwnerDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      documentType,
      boatId,
    }: {
      file: File;
      documentType: BoatDocumentType;
      boatId?: string | null;
    }) => {
      const { authId, ownerId } = await getCurrentOwnerProfileId();
      const supabase = createSupabaseBrowserClient();

      const isOwnerLevel =
        documentType === "LICENSE" || documentType === "SAILOR_CV";

      if (!isOwnerLevel && !boatId) {
        throw new Error("Boat id is required for boat-scoped documents");
      }

      const storagePath = isOwnerLevel
        ? `owners/${authId}/${Date.now()}-${file.name}`
        : `${boatId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("boat-documents")
        .upload(storagePath, file, {
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (isOwnerLevel) {
        await supabase
          .from("boat_documents")
          .delete()
          .eq("owner_id", ownerId)
          .eq("document_type", documentType)
          .is("boat_id", null);
      } else if (boatId && documentType === "INSURANCE") {
        await supabase
          .from("boat_documents")
          .delete()
          .eq("boat_id", boatId)
          .eq("document_type", "INSURANCE");
      }

      const { data, error } = await supabase
        .from("boat_documents")
        .insert({
          owner_id: ownerId,
          boat_id: isOwnerLevel ? null : boatId ?? null,
          document_type: documentType,
          storage_bucket: "boat-documents",
          storage_path: storagePath,
          mime_type: file.type || null,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to save document");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: OWNER_DOCUMENTS_QUERY_KEY,
      });
    },
  });
}
