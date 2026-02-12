import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as documentsApi from "./api";
import type { CreateDocumentBody } from "./api";

export function useDocumentsList(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  return useQuery({
    queryKey: ["documents", "list", params],
    queryFn: () => documentsApi.listDocuments(params),
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDocumentBody) => documentsApi.createDocument(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", "list"] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.deleteDocument(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", "list"] });
    },
  });
}
