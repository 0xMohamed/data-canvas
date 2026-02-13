import { useQuery } from "@tanstack/react-query";
import { getDocument } from "../api/documents.api";
import { useEditorStore } from "../state/editor.store";
import type { EditorSnapshot, EditorBlock, EditorRow } from "../models/editorTypes";
import { emptySnapshot } from "../models/editorTypes";
import { useEffect } from "react";
import { setupBeforeUnload } from "../state/autosave";

function normalizeSnapshot(data: unknown): EditorSnapshot {
  if (!data || typeof data !== "object") return emptySnapshot();
  const d = data as { slides?: unknown[] };
  if (!Array.isArray(d.slides) || d.slides.length === 0) return emptySnapshot();

  const makeEvenWidths = (count: number) => {
    if (count <= 0) return [];
    const even = 100 / count;
    const base = Array.from({ length: count }, (_, i) =>
      i === count - 1 ? 100 - even * (count - 1) : even,
    );
    return base;
  };

  const normalizeRows = (rows: unknown[]): EditorRow[] => {
    const safe = Array.isArray(rows) ? rows : [];
    return safe
      .map((r) => {
        const row = r as { id?: string; blocks?: unknown[]; widths?: unknown[] };
        const blocks = (Array.isArray(row.blocks) ? row.blocks : []).map((b: unknown) => {
          const block = b as { id?: string; type?: string; content?: unknown };
          return {
            id: block.id ?? `b_${Math.random().toString(36).slice(2, 10)}`,
            type: typeof block.type === "string" ? block.type : "text",
            content: block.content ?? {},
          } as EditorBlock;
        });

        const widthsRaw = Array.isArray(row.widths) ? row.widths : [];
        const widths = widthsRaw
          .map((w) => (typeof w === "number" ? w : 0))
          .slice(0, blocks.length);

        return {
          id: row.id ?? `row_${Math.random().toString(36).slice(2, 10)}`,
          blocks,
          widths: widths.length === blocks.length ? widths : makeEvenWidths(blocks.length),
        } as EditorRow;
      })
      .filter((r) => r.blocks.length > 0);
  };

  const migrateLegacyBlocksToRows = (legacyBlocks: unknown[]): EditorRow[] => {
    const blocks = (Array.isArray(legacyBlocks) ? legacyBlocks : []).map((b: unknown) => {
      const block = b as { id?: string; type?: string; content?: unknown; x?: number; y?: number };
      return {
        id: block.id ?? `b_${Math.random().toString(36).slice(2, 10)}`,
        type: typeof block.type === "string" ? block.type : "text",
        content: block.content ?? {},
        x: typeof block.x === "number" ? block.x : 0,
        y: typeof block.y === "number" ? block.y : 0,
      };
    });

    // Group by approximate y (row buckets), then sort by x.
    const sorted = [...blocks].sort((a, b) => (a.y - b.y) || (a.x - b.x));
    const ROW_BUCKET_PX = 80;
    const rows: Array<{ key: number; blocks: typeof sorted }> = [];

    for (const b of sorted) {
      const key = Math.round(b.y / ROW_BUCKET_PX);
      let row = rows.find((r) => r.key === key && r.blocks.length < 4);
      if (!row) {
        row = { key, blocks: [] as any };
        rows.push(row);
      }
      row.blocks.push(b);
    }

    return rows
      .sort((a, b) => a.key - b.key)
      .map((r) => {
        const migratedBlocks: EditorBlock[] = r.blocks.map((b) => ({ id: b.id, type: b.type, content: b.content }));
        return {
          id: `row_${Math.random().toString(36).slice(2, 10)}`,
          blocks: migratedBlocks,
          widths: makeEvenWidths(migratedBlocks.length),
        } as EditorRow;
      });
  };

  const slides = d.slides.map((s: unknown) => {
    const slide = s as {
      id?: string;
      title?: string;
      themeId?: string;
      rows?: unknown[];
      blocks?: unknown[];
    };

    const rows = Array.isArray(slide.rows)
      ? normalizeRows(slide.rows)
      : migrateLegacyBlocksToRows(slide.blocks ?? []);

    return {
      id: slide.id ?? `slide_${Math.random().toString(36).slice(2, 10)}`,
      title: typeof slide.title === "string" ? slide.title : "Slide",
      themeId: typeof slide.themeId === "string" ? slide.themeId : "dark-editorial",
      rows: rows.length
        ? rows
        : [
            {
              id: `row_${Math.random().toString(36).slice(2, 10)}`,
              blocks: [{ id: `b_${Math.random().toString(36).slice(2, 10)}`, type: "text", content: { text: "" } }],
              widths: [100],
            },
          ],
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
