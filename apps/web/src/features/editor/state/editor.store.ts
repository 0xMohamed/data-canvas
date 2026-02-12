import { create } from "zustand";
import type {
  EditorBlock,
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
import { generateBlockId, generateSlideId } from "../utils/ids";
import { arrayMove } from "@dnd-kit/sortable";

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
  moveBlock: (blockId: string, delta: { x: number; y: number }) => void;
  commitMove: (blockId: string, x: number, y: number) => void;
  addBlock: (
    slideId: string,
    block: Omit<EditorBlock, "id"> & { id?: string },
  ) => void;
  removeBlock: (blockId: string) => void;
  updateBlockContent: (blockId: string, content: unknown) => void;
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

function updateBlockInSlide(
  slide: EditorSlide,
  blockId: string,
  updater: (b: EditorBlock) => EditorBlock,
): EditorSlide {
  return {
    ...slide,
    blocks: slide.blocks.map((b) => (b.id === blockId ? updater(b) : b)),
  };
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

    selectBlock: (blockId) => set({ selectedBlockId: blockId }),

    setDragging: (isDragging) => set({ isDragging }),

    setSidebarCollapse: (isCollapsed) =>
      set({ isSidebarCollapsed: isCollapsed }),

    moveBlock: (blockId, delta) => {
      const { snapshot, currentSlideId } = get();
      const slide = currentSlideId
        ? getSlide(snapshot, currentSlideId)
        : undefined;
      if (!slide) return;
      const block = slide.blocks.find((b) => b.id === blockId);
      if (!block) return;
      const nextSlide = updateBlockInSlide(slide, blockId, (b) => ({
        ...b,
        x: b.x + delta.x,
        y: b.y + delta.y,
      }));
      set({
        snapshot: updateSlide(get().snapshot, currentSlideId!, () => nextSlide),
      });
    },

    commitMove: (blockId, x, y) => {
      const { snapshot, currentSlideId } = get();
      const slide = currentSlideId
        ? getSlide(snapshot, currentSlideId)
        : undefined;
      if (!slide) return;
      const nextSlide = updateBlockInSlide(slide, blockId, (b) => ({
        ...b,
        x,
        y,
      }));
      set({
        snapshot: updateSlide(get().snapshot, currentSlideId!, () => nextSlide),
      });
    },

    addBlock: (slideId, block) => {
      const id = block.id ?? generateBlockId();
      const newBlock: EditorBlock = {
        id,
        type: block.type,
        content: block.content ?? {},
        x: block.x ?? 0,
        y: block.y ?? 0,
      };
      set((state) => {
        const slide = getSlide(state.snapshot, slideId);
        if (!slide) return state;
        const nextSnapshot = updateSlide(state.snapshot, slideId, (s) => ({
          ...s,
          blocks: [...s.blocks, newBlock],
        }));
        return { snapshot: nextSnapshot };
      });
    },

    removeBlock: (blockId) => {
      set((state) => {
        let nextSnapshot = state.snapshot;
        for (const slide of state.snapshot.slides) {
          const found = slide.blocks.some((b) => b.id === blockId);
          if (found) {
            nextSnapshot = updateSlide(state.snapshot, slide.id, (s) => ({
              ...s,
              blocks: s.blocks.filter((b) => b.id !== blockId),
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
      const nextSlide = updateBlockInSlide(slide, blockId, (b) => ({
        ...b,
        content,
      }));
      set({
        snapshot: updateSlide(get().snapshot, currentSlideId!, () => nextSlide),
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
              blocks: [],
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
