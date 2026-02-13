import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { useEditorDnd } from "../state/editorDnd";

export function DropIndicatorOverlay() {
  const { indicatorRect } = useEditorDnd();

  if (!indicatorRect) return null;

  const style: CSSProperties = {
    position: "fixed",
    left: indicatorRect.x,
    top: indicatorRect.y,
    width: indicatorRect.width,
    height: indicatorRect.height,
    transform:
      indicatorRect.axis === "horizontal"
        ? "translateY(-50%)"
        : "translateX(-50%)",
    zIndex: 80,
    pointerEvents: "none",
  };

  return (
    <div
      className={cn(
        "bg-[color:var(--accent)]",
        "opacity-90",
        "rounded-sm",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_18px_rgba(99,102,241,0.55)]",
      )}
      style={style}
    />
  );
}
