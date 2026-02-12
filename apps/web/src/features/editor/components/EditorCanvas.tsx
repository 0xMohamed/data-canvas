import { useEditorStore } from "../state/editor.store";
import { SlideView } from "./SlideView";

import { getSlideTheme } from "../theme";
import SlidesSidebar from "./SlidesSidebar";
import CanvasToolbar from "./CanvasToolbar";
import EditorHeader from "./EditorHeader";

export function EditorCanvas() {
  const snapshot = useEditorStore((s) => s.snapshot);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  const selectBlock = useEditorStore((s) => s.selectBlock);

  const currentSlide = currentSlideId
    ? snapshot.slides.find((s) => s.id === currentSlideId)
    : snapshot.slides[0];
  const theme = currentSlide
    ? getSlideTheme(
        currentSlide.themeId as
          | "dark-editorial"
          | "light-editorial"
          | "high-contrast",
      )
    : null;

  const themeStyle = theme
    ? ({
        ["--editor-bg"]: theme.editorBg,
        ["--slide-bg"]: theme.slideBg,
        ["--slide-text"]: theme.text,
        ["--slide-muted"]: theme.muted,
        ["--slide-accent"]: theme.accent,
        ["--slide-gridLine"]: theme.gridLine,
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      className="flex flex-col h-screen"
      // style={themeStyle}
      onClick={() => selectBlock(null)}
    >
      <EditorHeader />
      <div className="flex flex-1 min-h-0">
        <SlidesSidebar />
        <SlideView />
        <CanvasToolbar />
      </div>
    </div>
  );
}
