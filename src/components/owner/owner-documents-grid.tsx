"use client";

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
import { useOwnerBoats } from "@/hooks/useOwnerBoats";
import { useOwnerDocuments } from "@/hooks/useOwnerDocuments";
import { useUploadOwnerDocument } from "@/hooks/useOwnerMutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BoatDocumentType } from "@/queries/fetchOwnerDocuments";

type DocumentCardModel = {
  key: string;
  title: string;
  subtitle: string;
  documentType: BoatDocumentType;
  boatId?: string | null;
  fileName: string | null;
  status: "validated" | "missing" | "draft";
};

export function OwnerDocumentsGrid({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations("Pages.OwnerSpace");
  const { data: boats = [] } = useOwnerBoats();
  const { data: documents = [] } = useOwnerDocuments();
  const uploadDocument = useUploadOwnerDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<{
    documentType: BoatDocumentType;
    boatId?: string | null;
  } | null>(null);

  const cards = useMemo<DocumentCardModel[]>(() => {
    const license = documents.find(
      (document) =>
        document.document_type === "LICENSE" && document.boat_id === null,
    );
    const sailorCv = documents.find(
      (document) =>
        document.document_type === "SAILOR_CV" && document.boat_id === null,
    );

    const ownerLevelCards: DocumentCardModel[] = [
      {
        key: "license",
        title: t("doc_license_title"),
        subtitle: license
          ? fileNameFromPath(license.storage_path)
          : t("doc_missing_file"),
        documentType: "LICENSE",
        boatId: null,
        fileName: license ? fileNameFromPath(license.storage_path) : null,
        status: license ? "validated" : "missing",
      },
      {
        key: "sailor-cv",
        title: t("doc_sailor_cv_title"),
        subtitle: sailorCv
          ? fileNameFromPath(sailorCv.storage_path)
          : t("doc_missing_file"),
        documentType: "SAILOR_CV",
        boatId: null,
        fileName: sailorCv ? fileNameFromPath(sailorCv.storage_path) : null,
        status: sailorCv ? "draft" : "missing",
      },
    ];

    const insuranceCards: DocumentCardModel[] = boats.map((boat) => {
      const insurance = documents.find(
        (document) =>
          document.document_type === "INSURANCE" &&
          document.boat_id === boat.id,
      );

      return {
        key: `insurance-${boat.id}`,
        title: t("doc_insurance_title", { boatName: boat.name }),
        subtitle: insurance
          ? fileNameFromPath(insurance.storage_path)
          : t("doc_missing_file"),
        documentType: "INSURANCE",
        boatId: boat.id,
        fileName: insurance ? fileNameFromPath(insurance.storage_path) : null,
        status: insurance ? "validated" : "missing",
      };
    });

    const allCards = [...ownerLevelCards, ...insuranceCards];
    return compact ? allCards.slice(0, 4) : allCards;
  }, [boats, compact, documents, t]);

  function openFilePicker(
    documentType: BoatDocumentType,
    boatId?: string | null,
  ) {
    pendingUploadRef.current = { documentType, boatId };
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    const pending = pendingUploadRef.current;
    event.target.value = "";

    if (!file || !pending) {
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file,
        documentType: pending.documentType,
        boatId: pending.boatId,
      });
      toast.success(t("doc_upload_success"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("doc_upload_error"),
      );
    } finally {
      pendingUploadRef.current = null;
    }
  }

  return (
    <>
      <input
        accept=".pdf,image/png,image/jpeg,text/plain"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
        ref={fileInputRef}
        type="file"
      />

      <div
        className={cn(
          "grid gap-4",
          compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {cards.map((card) => (
          <article
            key={card.key}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm",
              card.status === "missing"
                ? "border-amber-300"
                : "border-neutral-200",
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText aria-hidden className="size-4 text-[#1a2b48]" />
                <h3 className="text-sm font-semibold text-[#1a2b48]">
                  {card.title}
                </h3>
              </div>
              {card.status === "validated" ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {t("doc_status_validated")}
                </Badge>
              ) : card.status === "draft" ? (
                <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100">
                  {t("doc_status_draft")}
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {t("doc_status_missing")}
                </Badge>
              )}
            </div>

            <p className="mb-4 truncate text-xs text-neutral-500">
              {card.subtitle}
            </p>

            <Button
              className="w-full rounded-md bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
              disabled={uploadDocument.isPending}
              onClick={() => openFilePicker(card.documentType, card.boatId)}
              size="sm"
              type="button"
            >
              <Upload aria-hidden className="size-3.5" />
              {card.status === "missing"
                ? t("doc_upload_cta")
                : t("doc_replace_cta")}
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}

function fileNameFromPath(storagePath: string): string {
  const segments = storagePath.split("/");
  return segments[segments.length - 1] ?? storagePath;
}
