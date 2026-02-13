import { create } from "zustand";
import type {
  EditorBlock,
  EditorRow,
  EditorSlide,
  EditorSnapshot,
  DocumentMeta,
} from "../models/editorTypes";
import { DEFAULT_SNAPSHOT, emptySnapshot } from "../models/editorTypes";
import {
  createInitialHistory,
  pushCheckpoint,
  undo as historyUndo,
  redo as historyRedo,
} from "./undoRedo";
import { generateBlockId, generateRowId, generateSlideId } from "../utils/ids";
import { arrayMove } from "@dnd-kit/sortable";
import { resizeRowWidthsWithMeta } from "../layout-system/utils/resize";
import type { DropTarget } from "../layout-system/utils/dnd";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type EditorState = {
  // Document
  documentId: string | null;
  meta: DocumentMeta | null;
  snapshot: EditorSnapshot;
  revision: number;

  // Persistence
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  saveError: string | null;

  // UI
  currentSlideId: string | null;
  selectedBlockId: string | null;
  isDragging: boolean;
  isSidebarCollapsed: boolean;

  // History
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
};

type EditorActions = {
  setFromServer: (params: {
    documentId: string;
    meta: DocumentMeta;
    snapshot: EditorSnapshot;
    revision: number;
  }) => void;
  selectBlock: (blockId: string | null) => void;
  setDragging: (value: boolean) => void;
  setSidebarCollapse: (isCollapsed: boolean) => void;
  addBlock: (
    slideId: string,
    block: Omit<EditorBlock, "id"> & { id?: string },
  ) => void;
  removeBlock: (blockId: string) => void;
  updateBlockContent: (blockId: string, content: unknown) => void;
  updateLayoutBlockContent: (params: {
    slideId: string;
    blockId: string;
    content: unknown;
  }) => void;
  resizeLayoutRowDivider: (params: {
    slideId: string;
    rowId: string;
    dividerIndex: number;
    deltaPercent: number;
  }) => void;
  moveLayoutBlock: (params: {
    slideId: string;
    activeBlockId: string;
    target: DropTarget;
  }) => void;
  moveLayoutRow: (params: {
    slideId: string;
    activeRowId: string;
    target: DropTarget;
  }) => void;
  insertLayoutBlock: (params: {
    slideId: string;
    block: Omit<EditorBlock, "id">;
    target: DropTarget;
  }) => void;
  setSlideTitle: (slideId: string, title: string) => void;
  setCurrentSlideId: (slideId: string) => void;
  addSlide: (themeId?: string) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (activeId: string, overId: string) => void;
  renameSlide: (slideId: string, title: string) => void;
  setSnapshot: (snapshot: EditorSnapshot) => void;
  pushHistoryCheckpoint: () => void;
  undo: () => void;
  redo: () => void;
  setSaveStatus: (status: SaveStatus, error?: string | null) => void;
  setLastSavedAt: (iso: string | null) => void;
  reset: () => void;
};

function getSlide(
  snapshot: EditorSnapshot,
  slideId: string,
): EditorSlide | undefined {
  return snapshot.slides.find((s) => s.id === slideId);
}

function updateSlide(
  snapshot: EditorSnapshot,
  slideId: string,
  updater: (s: EditorSlide) => EditorSlide,
): EditorSnapshot {
  return {
    ...snapshot,
    slides: snapshot.slides.map((s) => (s.id === slideId ? updater(s) : s)),
  };
}

function updateBlockInRows(
  rows: EditorRow[],
  blockId: string,
  updater: (b: EditorBlock) => EditorBlock,
): EditorRow[] {
  return rows.map((r) => ({
    ...r,
    blocks: r.blocks.map((b) => (b.id === blockId ? updater(b) : b)),
  }));
}

function findBlockLocation(slide: EditorSlide, blockId: string): { rowIndex: number; blockIndex: number } | null {
  for (let r = 0; r < slide.rows.length; r += 1) {
    const idx = slide.rows[r].blocks.findIndex((b) => b.id === blockId);
    if (idx !== -1) return { rowIndex: r, blockIndex: idx };
  }
  return null;
}

function normalizeRowWidths(row: EditorRow): EditorRow {
  if (row.blocks.length === 0) return { ...row, widths: [] };
  if (row.widths.length === row.blocks.length) return row;
  const even = 100 / row.blocks.length;
  const widths = row.blocks.map((_, i) => (i === row.blocks.length - 1 ? 100 - even * (row.blocks.length - 1) : even));
  return { ...row, widths };
}

const initialState: EditorState = {
  documentId: null,
  meta: null,
  snapshot: DEFAULT_SNAPSHOT,
  revision: 0,
  saveStatus: "idle",
  lastSavedAt: null,
  saveError: null,
  currentSlideId: null,
  selectedBlockId: null,
  isDragging: false,
  isSidebarCollapsed: false,
  ...createInitialHistory(),
};

export const useEditorStore = create<EditorState & EditorActions>(
  (set, get) => ({
    ...initialState,

    setFromServer: (params) => {
      const snapshot = params.snapshot?.slides?.length
        ? params.snapshot
        : emptySnapshot();
      const currentSlideId =
        params.snapshot?.slides?.[0]?.id ?? snapshot.slides[0]?.id ?? null;
      set({
        documentId: params.documentId,
        meta: params.meta,
        snapshot,
        revision: params.revision,
        currentSlideId,
        selectedBlockId: null,
        saveStatus: "idle",
        saveError: null,
        ...createInitialHistory(),
      });
    },

    moveLayoutRow: ({ slideId, activeRowId, target }) => {
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;

        if (target.kind !== "row-reorder") return state;

        const fromIndex = slide.rows.findIndex((r) => r.id === activeRowId);
        if (fromIndex === -1) return state;

        const activeRow = slide.rows[fromIndex];
        const remaining = slide.rows.filter((r) => r.id !== activeRowId);

        const rawInsertAt = target.edge === "before" ? target.rowIndex : target.rowIndex + 1;
        const insertAt = Math.min(Math.max(0, rawInsertAt), remaining.length);

        const nextRows = [
          ...remaining.slice(0, insertAt),
          activeRow,
          ...remaining.slice(insertAt),
        ].map(normalizeRowWidths);

        const nextSlide: EditorSlide = { ...slide, rows: nextRows };
        return { snapshot: updateSlide(state.snapshot, slideId, () => nextSlide) };
      });
    },

    selectBlock: (blockId) => set({ selectedBlockId: blockId }),

    setDragging: (isDragging) => set({ isDragging }),

    setSidebarCollapse: (isCollapsed) =>
      set({ isSidebarCollapsed: isCollapsed }),

    addBlock: (slideId, block) => {
      const id = block.id ?? generateBlockId();
      const newBlock: EditorBlock = {
        id,
        type: block.type,
        content: block.content ?? {},
      };
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;

        const rows = slide.rows.length ? slide.rows.map(normalizeRowWidths) : [];
        const lastRow = rows[rows.length - 1];

        let nextRows: EditorRow[];
        if (!lastRow) {
          const row: EditorRow = { id: generateRowId(), blocks: [newBlock], widths: [100] };
          nextRows = [row];
        } else if (lastRow.blocks.length < 4) {
          const nextLast: EditorRow = normalizeRowWidths({
            ...lastRow,
            blocks: [...lastRow.blocks, newBlock],
            widths: [...lastRow.widths, 0],
          });
          nextRows = [...rows.slice(0, -1), normalizeRowWidths(nextLast)];
        } else {
          const row: EditorRow = { id: generateRowId(), blocks: [newBlock], widths: [100] };
          nextRows = [...rows, row];
        }

        const nextSnapshot = updateSlide(state.snapshot, slideId, (s) => ({
          ...s,
          rows: nextRows.map(normalizeRowWidths),
        }));
        return { snapshot: nextSnapshot };
      });
    },

    removeBlock: (blockId) => {
      set((state) => {
        let nextSnapshot = state.snapshot;
        for (const slide of state.snapshot.slides) {
          const found = slide.rows.some((r) => r.blocks.some((b) => b.id === blockId));
          if (found) {
            nextSnapshot = updateSlide(state.snapshot, slide.id, (s) => ({
              ...s,
              rows: s.rows
                .map((r) => ({ ...r, blocks: r.blocks.filter((b) => b.id !== blockId) }))
                .filter((r) => r.blocks.length > 0)
                .map(normalizeRowWidths),
            }));
            break;
          }
        }
        return {
          snapshot: nextSnapshot,
          selectedBlockId:
            state.selectedBlockId === blockId ? null : state.selectedBlockId,
        };
      });
    },

    updateBlockContent: (blockId, content) => {
      const { snapshot, currentSlideId } = get();
      const slide = currentSlideId
        ? getSlide(snapshot, currentSlideId)
        : undefined;
      if (!slide) return;
      const nextSlide: EditorSlide = {
        ...slide,
        rows: updateBlockInRows(slide.rows, blockId, (b) => ({ ...b, content })),
      };
      set({
        snapshot: updateSlide(get().snapshot, currentSlideId!, () => nextSlide),
      });
    },

    updateLayoutBlockContent: ({ slideId, blockId, content }) => {
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;

        const nextSlide: EditorSlide = {
          ...slide,
          rows: updateBlockInRows(slide.rows, blockId, (b) => ({ ...b, content })),
        };

        return { snapshot: updateSlide(state.snapshot, slideId, () => nextSlide) };
      });
    },

    resizeLayoutRowDivider: ({ slideId, rowId, dividerIndex, deltaPercent }) => {
      const state = get();
      const slide = getSlide(state.snapshot, slideId);
      if (!slide) return { clamped: false, actualDelta: 0 };

      let clamped = false;
      let actualDelta = 0;

      const nextSlide: EditorSlide = {
        ...slide,
        rows: slide.rows.map((r) => {
          if (r.id !== rowId) return normalizeRowWidths(r);
          const normalized = normalizeRowWidths(r);
          const initialWidths = normalized.widths;
          const res = resizeRowWidthsWithMeta({
            widths: initialWidths,
            dividerIndex,
            deltaPercent,
          });
          clamped = res.clamped;
          const nextWidths = res.widths;
          actualDelta = nextWidths[dividerIndex] - initialWidths[dividerIndex];
          return normalizeRowWidths({ ...r, widths: nextWidths });
        }),
      };

      set({ snapshot: updateSlide(state.snapshot, slideId, () => nextSlide) });
      return { clamped, actualDelta };
    },

    moveLayoutBlock: ({ slideId, activeBlockId, target }) => {
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;

        if (target.kind === "row-reorder") return state;

        const loc = findBlockLocation(slide, activeBlockId);
        if (!loc) return state;

        const activeRow = slide.rows[loc.rowIndex];
        const activeBlock = activeRow.blocks[loc.blockIndex];

        // Remove from source.
        let rows = slide.rows.map((r, ri) => {
          if (ri !== loc.rowIndex) return normalizeRowWidths(r);
          const blocks = r.blocks.filter((b) => b.id !== activeBlockId);
          return normalizeRowWidths({ ...r, blocks });
        }).filter((r) => r.blocks.length > 0);

        if (target.kind === 'new-row') {
          const insertAt = target.edge === 'before' ? target.rowIndex : target.rowIndex + 1;
          const row: EditorRow = { id: generateRowId(), blocks: [activeBlock], widths: [100] };
          rows = [...rows.slice(0, insertAt), row, ...rows.slice(insertAt)].map(normalizeRowWidths);
        } else {
          const rowIndex = Math.min(Math.max(0, target.rowIndex), rows.length - 1);
          const row = normalizeRowWidths(rows[rowIndex]);

          if (row.blocks.length >= 4) {
            const insertAt = rowIndex + 1;
            const newRow: EditorRow = { id: generateRowId(), blocks: [activeBlock], widths: [100] };
            rows = [...rows.slice(0, insertAt), newRow, ...rows.slice(insertAt)].map(normalizeRowWidths);
          } else {
            const insertionIndex = target.edge === 'before' ? target.blockIndex : target.blockIndex + 1;
            const blocks = [...row.blocks.slice(0, insertionIndex), activeBlock, ...row.blocks.slice(insertionIndex)];
            const nextRow = normalizeRowWidths({ ...row, blocks, widths: row.widths });
            rows = rows.map((r, i) => (i === rowIndex ? nextRow : normalizeRowWidths(r)));
          }
        }

        const nextSlide: EditorSlide = { ...slide, rows: rows.map(normalizeRowWidths) };
        return { snapshot: updateSlide(state.snapshot, slideId, () => nextSlide) };
      });
    },

    insertLayoutBlock: ({ slideId, block, target }) => {
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;

        if (target.kind === "row-reorder") return state;

        const newBlock: EditorBlock = {
          id: generateBlockId(),
          type: block.type,
          content: block.content ?? {},
        };

        let rows = slide.rows.map(normalizeRowWidths);

        if (target.kind === 'new-row') {
          const insertAt = target.edge === 'before' ? target.rowIndex : target.rowIndex + 1;
          const row: EditorRow = { id: generateRowId(), blocks: [newBlock], widths: [100] };
          rows = [...rows.slice(0, insertAt), row, ...rows.slice(insertAt)].map(normalizeRowWidths);
        } else {
          const rowIndex = Math.min(Math.max(0, target.rowIndex), rows.length - 1);
          const row = normalizeRowWidths(rows[rowIndex]);

          if (row.blocks.length >= 4) {
            const insertAt = rowIndex + 1;
            const newRow: EditorRow = { id: generateRowId(), blocks: [newBlock], widths: [100] };
            rows = [...rows.slice(0, insertAt), newRow, ...rows.slice(insertAt)].map(normalizeRowWidths);
          } else {
            const insertionIndex = target.edge === 'before' ? target.blockIndex : target.blockIndex + 1;
            const blocks = [...row.blocks.slice(0, insertionIndex), newBlock, ...row.blocks.slice(insertionIndex)];
            const nextRow = normalizeRowWidths({ ...row, blocks, widths: row.widths });
            rows = rows.map((r, i) => (i === rowIndex ? nextRow : normalizeRowWidths(r)));
          }
        }

        const nextSlide: EditorSlide = { ...slide, rows: rows.map(normalizeRowWidths) };
        return { snapshot: updateSlide(state.snapshot, slideId, () => nextSlide) };
      });
    },

    setSlideTitle: (slideId, title) => {
      set((state) => ({
        snapshot: updateSlide(state.snapshot, slideId, (s) => ({
          ...s,
          title,
        })),
      }));
    },

    setCurrentSlideId: (slideId) => set({ currentSlideId: slideId }),

    addSlide: (themeId = "dark-editorial") => {
      const id = generateSlideId();
      const activeSlide = get().currentSlideId
        ? getSlide(get().snapshot, get().currentSlideId!)
        : get().snapshot.slides[0];
      set((state) => ({
        snapshot: {
          ...state.snapshot,
          slides: [
            ...state.snapshot.slides,
            {
              id,
              title: `Slide ${state.snapshot.slides.length + 1}`,
              themeId: themeId ?? activeSlide?.themeId ?? "dark-editorial",
              rows: [
                {
                  id: generateRowId(),
                  blocks: [{ id: generateBlockId(), type: "text", content: { text: "" } }],
                  widths: [100],
                },
              ],
            },
          ],
        },
        currentSlideId: id,
      }));
    },

    removeSlide: (slideId) => {
      set((state) => {
        const slides = state.snapshot.slides;
        const index = slides.findIndex((s) => s.id === slideId);
        if (index === -1) return state;

        const nextSlides = slides.filter((s) => s.id !== slideId);

        const nextCurrent =
          state.currentSlideId === slideId
            ? (nextSlides[index - 1]?.id ?? nextSlides[0]?.id ?? null)
            : state.currentSlideId;

        return {
          snapshot: { ...state.snapshot, slides: nextSlides },
          currentSlideId: nextCurrent,
          selectedBlockId: null,
        };
      });
    },

    reorderSlides: (activeId, overId) => {
      set((state) => {
        const slides = state.snapshot.slides;
        const oldIndex = slides.findIndex((s) => s.id === activeId);
        const newIndex = slides.findIndex((s) => s.id === overId);

        if (oldIndex === -1 || newIndex === -1) return state;
        if (oldIndex === newIndex) return state;

        const nextSlides = arrayMove(slides, oldIndex, newIndex);

        return {
          snapshot: { ...state.snapshot, slides: nextSlides },
        };
      });
    },

    renameSlide: (slideId, title) => {
      set((state) => ({
        snapshot: updateSlide(state.snapshot, slideId, (s) => ({
          ...s,
          title,
        })),
      }));
    },

    setSnapshot: (snapshot) => set({ snapshot }),

    pushHistoryCheckpoint: () => {
      set((state) => {
        const next = pushCheckpoint(
          { undoStack: state.undoStack, redoStack: state.redoStack },
          state.snapshot,
        );
        return { undoStack: next.undoStack, redoStack: next.redoStack };
      });
    },

    undo: () => {
      const state = get();
      const result = historyUndo(
        { undoStack: state.undoStack, redoStack: state.redoStack },
        state.snapshot,
      );
      if (result)
        set({
          snapshot: result.snapshot,
          undoStack: result.history.undoStack,
          redoStack: result.history.redoStack,
        });
    },

    redo: () => {
      const state = get();
      const result = historyRedo(
        { undoStack: state.undoStack, redoStack: state.redoStack },
        state.snapshot,
      );
      if (result)
        set({
          snapshot: result.snapshot,
          undoStack: result.history.undoStack,
          redoStack: result.history.redoStack,
        });
    },

    setSaveStatus: (saveStatus, saveError = null) =>
      set({ saveStatus, saveError: saveError ?? null }),

    setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

    reset: () => set(initialState),
  }),
);
