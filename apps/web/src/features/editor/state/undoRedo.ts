import type { EditorSnapshot } from "../models/editorTypes";

const MAX_HISTORY = 50;

export type HistoryState = {
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
};

export function createInitialHistory(): HistoryState {
  return { undoStack: [], redoStack: [] };
}

export function pushCheckpoint(
  state: HistoryState,
  snapshot: EditorSnapshot
): HistoryState {
  const undoStack = [...state.undoStack, snapshot].slice(-MAX_HISTORY);
  return { undoStack, redoStack: [] };
}

export function undo(
  state: HistoryState,
  current: EditorSnapshot
): { history: HistoryState; snapshot: EditorSnapshot } | null {
  if (state.undoStack.length === 0) return null;
  const prev = state.undoStack[state.undoStack.length - 1];
  const undoStack = state.undoStack.slice(0, -1);
  const redoStack = [...state.redoStack, current];
  return {
    history: { undoStack, redoStack },
    snapshot: prev,
  };
}

export function redo(
  state: HistoryState,
  current: EditorSnapshot
): { history: HistoryState; snapshot: EditorSnapshot } | null {
  if (state.redoStack.length === 0) return null;
  const next = state.redoStack[state.redoStack.length - 1];
  const redoStack = state.redoStack.slice(0, -1);
  const undoStack = [...state.undoStack, current];
  return {
    history: { undoStack, redoStack },
    snapshot: next,
  };
}
