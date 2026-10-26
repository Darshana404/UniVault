"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentKeys } from "./useDocuments";

export interface UploadFormData {
  file: File;
  title: string;
  description?: string;
  subject: string;
}

export interface UploadResult {
  document: {
    id: string;
    title: string;
    validation_status: string;
    created_at: string;
  };
}

async function uploadDocument(
  formData: UploadFormData
): Promise<UploadResult> {
  const data = new FormData();
  data.append("file", formData.file);
  data.append("title", formData.title);
  data.append("subject", formData.subject);
  if (formData.description) {
    data.append("description", formData.description);
  }

  const res = await fetch("/api/documents", {
    method: "POST",
    body: data,
    // Do NOT set Content-Type — browser sets it with correct boundary
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed.");
  return json.data;
}

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      // Invalidate all document lists so new document appears
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

