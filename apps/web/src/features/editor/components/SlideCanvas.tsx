import type { ReactNode } from "react";
import type {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  Modifier,
  DndContextProps,
} from "@dnd-kit/core";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import type { BlockBase } from "../model/types";
import { DragOverlayPreview } from "./DragOverlayPreview";
import { cn } from "@/lib/utils";

export function SlideCanvas(props: {
  mode: "edit" | "public";
  setViewportEl: (el: HTMLDivElement | null) => void;
  setGridEl: (el: HTMLDivElement | null) => void;
  slideCols: number;
  rowHeightPx: number;
  gridGapPx: number;
  sensors: DndContextProps["sensors"];
  onDragStart: (event: DragStartEvent) => void;
  onDragMove: (event: DragMoveEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  overlayModifiers: Modifier[];
  overlayBlock: BlockBase | null;
  overlayWidthPx: number | null;
  overlayHeightPx: number | null;
  children: ReactNode;
}) {
  return (
    <div
      ref={props.setViewportEl}
      className={cn(
        props.mode === "public"
          ? ""
          : "flex justify-center items-start w-full h-full flex-1 px-4 py-6 pt-26"
      )}
    >
      <DndContext
        sensors={props.sensors}
        onDragStart={props.onDragStart}
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
      >
        <div
          ref={props.setGridEl}
          className={cn(
            "relative overflow-hidden border",
            "bg-[var(--slide-bg)] text-[color:var(--slide-text)]",
            props.mode === "public"
              ? "min-h-screen w-full border-0"
              : "rounded-2xl border-[color:var(--slide-gridLine)]"
          )}
          style={
            props.mode === "public"
              ? undefined
              : {
                  width: `calc(var(--slide-max-width) * var(--slide-scale))`,
                  minHeight: `calc(var(--slide-max-width) / var(--slide-ratio) * var(--slide-scale))`,
                  padding: `1.5em`,
                  boxSizing: `border-box`,
                }
          }
        >
          <div
            className="grid content-start"
            style={{
              gridTemplateColumns: `repeat(${props.slideCols}, minmax(0, 1fr))`,
              gridAutoRows: `${props.rowHeightPx}px`,
              gap: props.gridGapPx,
              minHeight: props.mode === "public" ? "100%" : undefined,
            }}
          >
            {props.children}
          </div>
        </div>

        <DragOverlay
          adjustScale
          dropAnimation={null}
          modifiers={props.overlayModifiers}
        >
          {props.overlayBlock ? (
            <DragOverlayPreview
              block={props.overlayBlock}
              overlayWidthPx={props.overlayWidthPx}
              overlayHeightPx={props.overlayHeightPx}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
