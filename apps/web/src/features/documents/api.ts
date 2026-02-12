import { api } from "@/lib/api/axios";

export type DocumentMeta = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  publicToken: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ListDocumentsResponse = {
  data: {
    items: DocumentMeta[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateDocumentBody = {
  title: string;
  description: string | null;
  isPublic?: boolean;
};

export type CreateDocumentResponse = {
  message: string;
  data: DocumentMeta;
};

export async function listDocuments(params?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<ListDocumentsResponse> {
  const res = await api.get<ListDocumentsResponse>("/documents", { params });
  return res.data;
}

export async function createDocument(
  body: CreateDocumentBody
): Promise<CreateDocumentResponse> {
  const res = await api.post<CreateDocumentResponse>("/documents", body);
  return res.data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await api.delete(`/documents/${documentId}`);
}
