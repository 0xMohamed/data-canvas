import { useEditorStore } from "./editor.store";
import { updateDocumentSnapshot, type ConflictError } from "../api/documents.api";
import type { EditorSnapshot } from "../models/editorTypes";

const TYPING_DEBOUNCE_MS = 800;
const STRUCTURAL_DEBOUNCE_MS = 200;

let typingTimer: ReturnType<typeof setTimeout> | null = null;
let structuralTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
  if (structuralTimer) {
    clearTimeout(structuralTimer);
    structuralTimer = null;
  }
}

function scheduleSave(mode: "typing" | "structural") {
  const delay = mode === "typing" ? TYPING_DEBOUNCE_MS : STRUCTURAL_DEBOUNCE_MS;
  const timerRef = mode === "typing" ? typingTimer : structuralTimer;
  const setTimer = (t: ReturnType<typeof setTimeout> | null) => {
    if (mode === "typing") typingTimer = t;
    else structuralTimer = t;
  };

  if (timerRef) clearTimeout(timerRef);
  const timer = setTimeout(() => {
    if (mode === "typing") typingTimer = null;
    else structuralTimer = null;
    flushSave();
  }, delay);
  setTimer(timer);
}

export function flushSave(): Promise<boolean> {
  const { documentId, snapshot, revision, setSaveStatus, setFromServer, setLastSavedAt } =
    useEditorStore.getState();
  if (!documentId) return Promise.resolve(false);

  setSaveStatus("saving");
  return updateDocumentSnapshot(documentId, {
    baseRevision: revision,
    data: snapshot,
  })
    .then((res) => {
      useEditorStore.setState({ revision: res.revision });
      setSaveStatus("saved");
      setLastSavedAt(res.savedAt);
      return true;
    })
    .catch((err: { response?: { status: number; data?: ConflictError } }) => {
      if (err.response?.status === 409) {
        const details = err.response.data?.error?.details;
        setSaveStatus("error", "Conflict: document was modified elsewhere.");
        if (details?.currentRevision != null && details?.data != null) {
          const meta = useEditorStore.getState().meta;
          if (meta) {
            setFromServer({
              documentId,
              meta,
              snapshot: details.data as EditorSnapshot,
              revision: details.currentRevision,
            });
          }
        }
      } else {
        const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Save failed";
        setSaveStatus("error", message);
      }
      return false;
    });
}

/** Call after typing (debounced 800ms). */
export function scheduleSaveAfterTyping() {
  scheduleSave("typing");
}

/** Call after structural edit (add/remove block, drag end). Debounced 200ms. */
export function scheduleSaveAfterStructural() {
  scheduleSave("structural");
}

/** Call on drag end (pointerup). Saves immediately after a short delay to allow checkpoint. */
export function saveOnDragEnd() {
  if (structuralTimer) {
    clearTimeout(structuralTimer);
    structuralTimer = null;
  }
  setTimeout(() => flushSave(), 50);
}

/** Best-effort save on beforeunload. */
export function setupBeforeUnload() {
  window.addEventListener("beforeunload", () => {
    clearTimers();
    flushSave();
  });
}
