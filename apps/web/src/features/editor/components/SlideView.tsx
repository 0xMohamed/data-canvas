import { useEditorStore } from "../state/editor.store";
import { getSlideTheme } from "../theme";
import { cn } from "@/lib/utils";
import { SlideLayoutView } from "../layout-system/components/SlideLayoutView";

export function SlideView() {
  const snapshot = useEditorStore((s) => s.snapshot);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const isCollapsed = useEditorStore((s) => s.isSidebarCollapsed);

  const slide = currentSlideId
    ? snapshot.slides.find((s) => s.id === currentSlideId)
    : snapshot.slides[0];

  if (!slide) return null;

  const theme = getSlideTheme(
    slide.themeId as "dark-editorial" | "light-editorial" | "high-contrast",
  );

  const style = {
    ["--editor-bg"]: theme.editorBg,
    ["--slide-bg"]: theme.slideBg,
    ["--slide-surface"]: theme.surface,
    ["--slide-text"]: theme.text,
    ["--slide-muted"]: theme.muted,
    ["--slide-accent"]: theme.accent,
    ["--slide-gridLine"]: theme.gridLine,
  } as React.CSSProperties;

  return (
    <main
      className={cn(
        "flex-1 flex items-center justify-center p-6 overflow-auto transition-[padding-left]",
        isCollapsed ? "" : " pl-32",
      )}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl border border-[color:var(--slide-gridLine)] bg-[color:var(--slide-bg)] text-[color:var(--slide-text)] overflow-hidden",
        )}
        style={{
          ...style,
          width: `calc(var(--slide-max-width) * var(--slide-scale))`,
          minHeight: `calc(var(--slide-max-width) / var(--slide-ratio) * var(--slide-scale))`,
          padding: `1.5em`,
          boxSizing: `border-box`,
        }}
      >
        <div className="absolute inset-0 p-10">
          <div className="relative w-full h-full">
            <div
              className={cn("w-full h-full", "flex flex-col justify-center")}
            >
              <SlideLayoutView slideId={slide.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
