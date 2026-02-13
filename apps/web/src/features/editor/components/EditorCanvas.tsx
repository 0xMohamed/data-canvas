import { useEditorStore } from "../state/editor.store";
import { SlideView } from "./SlideView";

import SlidesSidebar from "./SlidesSidebar";
import CanvasToolbar from "./CanvasToolbar";
import EditorHeader from "./EditorHeader";
import { scheduleSaveAfterStructural } from "../state/autosave";
import { EditorDndProvider } from "../layout-system/state/editorDnd";
import { DropIndicatorOverlay } from "../layout-system/components/DropIndicatorOverlay";

export function EditorCanvas() {
  const snapshot = useEditorStore((s) => s.snapshot);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  const selectBlock = useEditorStore((s) => s.selectBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);

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
              activeThemeId={currentSlide.themeId as any}
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
