import { useEditorStore } from "../state/editor.store";
import { SlideView } from "./SlideView";
import { useEffect } from "react";
import SlidesSidebar from "./SlidesSidebar";
import CanvasToolbar from "./CanvasToolbar";
import EditorHeader from "./EditorHeader";
import { scheduleSaveAfterStructural } from "../state/autosave";
import { EditorDndProvider } from "../layout-system/state/editorDnd";
import { DropIndicatorOverlay } from "../layout-system/components/DropIndicatorOverlay";
import type { SlideTheme } from "../theme";

export function EditorCanvas() {
  const snapshot = useEditorStore((s) => s.snapshot);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  const selectBlock = useEditorStore((s) => s.selectBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      if (isMod && e.key === "z") {
        
        e.preventDefault();
        if (isShift) {
          redo();
        } else {
          undo();
        }
        scheduleSaveAfterStructural();
      }

      if (isMod && e.key === "y") {
        e.preventDefault();
        redo();
        scheduleSaveAfterStructural();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const currentSlide = currentSlideId
    ? snapshot.slides.find((s) => s.id === currentSlideId)
    : snapshot.slides[0];

  return (
    <div
      className="flex flex-col h-screen"
      onClick={() => selectBlock(null)}
    >
      <EditorHeader />
      <div className="flex flex-1 min-h-0">
        <SlidesSidebar />
        {currentSlide ? (
          <EditorDndProvider slideId={currentSlide.id}>
            <SlideView />
            <DropIndicatorOverlay />
            <CanvasToolbar
              activeThemeId={currentSlide.themeId as SlideTheme["id"]}
              onThemeChange={() => {
                // theme switching already exists elsewhere; keep noop for now
              }}
              onAddBlock={(type) => {
                pushHistoryCheckpoint();
                addBlock(currentSlide.id, {
                  type,
                  content: type === "text" ? { text: "" } : {},
                });
                scheduleSaveAfterStructural();
              }}
            />
          </EditorDndProvider>
        ) : (
          <SlideView />
        )}
      </div>
    </div>
  );
}
