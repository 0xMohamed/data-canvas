import { useQuery } from "@tanstack/react-query";
import { getDocument } from "../api/documents.api";
import { useEditorStore } from "../state/editor.store";
import type { EditorSnapshot, EditorBlock } from "../models/editorTypes";
import { emptySnapshot } from "../models/editorTypes";
import { useEffect } from "react";
import { setupBeforeUnload } from "../state/autosave";

function normalizeSnapshot(data: unknown): EditorSnapshot {
  if (!data || typeof data !== "object") return emptySnapshot();
  const d = data as { slides?: unknown[] };
  if (!Array.isArray(d.slides) || d.slides.length === 0) return emptySnapshot();
  const slides = d.slides.map((s: unknown) => {
    const slide = s as { id?: string; title?: string; themeId?: string; blocks?: unknown[] };
    const blocks = (Array.isArray(slide.blocks) ? slide.blocks : []).map((b: unknown) => {
      const block = b as { id?: string; type?: string; content?: unknown; x?: number; y?: number };
      return {
        id: block.id ?? `b_${Math.random().toString(36).slice(2, 10)}`,
        type: typeof block.type === "string" ? block.type : "text",
        content: block.content ?? {},
        x: typeof block.x === "number" ? block.x : 0,
        y: typeof block.y === "number" ? block.y : 0,
      } as EditorBlock;
    });
    return {
      id: slide.id ?? `slide_${Math.random().toString(36).slice(2, 10)}`,
      title: typeof slide.title === "string" ? slide.title : "Slide",
      themeId: typeof slide.themeId === "string" ? slide.themeId : "dark-editorial",
      blocks,
    };
  });
  return { slides };
}

export function useDocument(documentId: string) {
  const setFromServer = useEditorStore((s) => s.setFromServer);
  const query = useQuery({
    queryKey: ["documents", documentId],
    queryFn: () => getDocument(documentId),
    enabled: Boolean(documentId),
  });

  useEffect(() => {
    if (!query.data) return;
    const doc = query.data;
    const snapshot = normalizeSnapshot(doc.data);
    setFromServer({
      documentId: doc.id,
      meta: {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        isPublic: doc.isPublic,
      },
      snapshot,
      revision: doc.revision,
    });
  }, [query.data, setFromServer]);

  useEffect(() => {
    setupBeforeUnload();
  }, []);

  return query;
}
