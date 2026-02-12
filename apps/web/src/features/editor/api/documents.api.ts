import { api } from "@/lib/api/axios";
import type { EditorSnapshot } from "../models/editorTypes";

export type DocumentResponse = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  revision: number;
  data: EditorSnapshot | null;
};

export type UpdateSnapshotBody = {
  baseRevision: number;
  data: EditorSnapshot;
};

export type UpdateSnapshotResponse = {
  revision: number;
  savedAt: string;
};

export type ConflictError = {
  error: {
    code: "CONFLICT";
    message: string;
    details?: { currentRevision?: number; data?: EditorSnapshot | null };
  };
};

export async function getDocument(
  documentId: string,
): Promise<DocumentResponse> {
  const res = await api.get<DocumentResponse>(`/documents/${documentId}`);
  return res.data;
}

export async function updateDocumentSnapshot(
  documentId: string,
  body: UpdateSnapshotBody,
): Promise<UpdateSnapshotResponse> {
  console.log("CALLING PUT updateDocumentSnapshot", { documentId, body });
  const res = await api.put<UpdateSnapshotResponse>(
    `/documents/${documentId}`,
    body,
  );
  return res.data;
}
