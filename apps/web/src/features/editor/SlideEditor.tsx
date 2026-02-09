import React, { useLayoutEffect, useRef, useState } from "react";
import type {
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Undo2 } from "lucide-react";

import type { BlockId, BlockType, Deck, Slide } from "./model/types";
import {
  DEFAULT_GRID_GAP_PX,
  DEFAULT_ROW_HEIGHT_PX,
  getColWidthPx,
  resolveCollisions,
} from "./model/layout";
import { BlockPicker } from "./components/BlockPicker";
import { DraggableBlock } from "./components/DraggableBlock";
import { EditableTitle } from "./components/EditableTitle";
import { RightControlRail } from "./components/RightControlRail";
import { SlideCanvas } from "./components/SlideCanvas";
import { SlidesSidebar } from "./components/SlidesSidebar";
import { SlideToolbar } from "./components/SlideToolbar";
import { useDeckState } from "./hooks/useDeckState";
import { useDndController } from "./hooks/useDndController";
import { useResizeController } from "./hooks/useResizeController";
import { getSlideTheme, type SlideTheme } from "./theme";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SLIDE_COLS = 12;
const SLIDE_ASPECT_RATIO = 16 / 9;

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

type EditorMode = "edit" | "public";

export function SlideEditor(props: { initialDeck?: Deck } = {}) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const deckState = useDeckState({
    initialDeck: props.initialDeck ?? makeDemoDeck(),
  });
  const deck = deckState.deck;
  const activeSlide = deckState.activeSlide;
  const actions = deckState.actions;

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const dndController = useDndController({
    mode,
    blocks: activeSlide.blocks,
    updateActiveSlide: actions.updateActiveSlide,
    setMessage,
  });

  const resizeController = useResizeController({
    updateActiveSlide: actions.updateActiveSlide,
    setMessage,
  });

  function addBlock(type: BlockType) {
    setPickerOpen(false);
    actions.addBlock(type);
  }

  function getGridMetricsForResize() {
    const gridEl = gridRef.current;
    if (!gridEl) return null;

    const rect = gridEl.getBoundingClientRect();
    const colWidthPx = getColWidthPx(rect.width, DEFAULT_GRID_GAP_PX);
    const stepXPx = colWidthPx + DEFAULT_GRID_GAP_PX;
    const stepYPx = DEFAULT_ROW_HEIGHT_PX + DEFAULT_GRID_GAP_PX;

    return { stepXPx, stepYPx };
  }

  function getGridMetricsForDrag() {
    const gridEl = gridRef.current;
    if (!gridEl) return null;

    const rect = gridEl.getBoundingClientRect();
    const colWidthPx = getColWidthPx(rect.width, DEFAULT_GRID_GAP_PX);
    const rowStepPx = DEFAULT_ROW_HEIGHT_PX + DEFAULT_GRID_GAP_PX;

    const maxRows = getSlideMaxRows({ rowStepPx });
    if (!maxRows) return null;

    return { colWidthPx, rowStepPx, maxRows };
  }

  function getSlideMaxRows(params: { rowStepPx: number }) {
    const gridEl = gridRef.current;
    if (!gridEl) return null;

    const rect = gridEl.getBoundingClientRect();
    const paddingPx = 16;
    const innerHeightPx = Math.max(0, rect.height - paddingPx * 2);

    // Total height of N rows = N*rowHeight + (N-1)*gap = N*rowStep - gap.
    // Solve for N given available height: N <= (innerHeight + gap)/rowStep.
    const maxRows = Math.max(
      1,
      Math.floor((innerHeightPx + DEFAULT_GRID_GAP_PX) / params.rowStepPx)
    );
    return maxRows;
  }

  function startResize(params: {
    blockId: BlockId;
    axis: "x" | "y";
    clientX: number;
    clientY: number;
  }) {
    const metrics = getGridMetricsForResize();
    if (!metrics) return;

    const maxRows = getSlideMaxRows({ rowStepPx: metrics.stepYPx });
    if (!maxRows) return;

    resizeController.startResize({
      blocks: activeSlide.blocks,
      blockId: params.blockId,
      axis: params.axis,
      clientX: params.clientX,
      clientY: params.clientY,
      stepXPx: metrics.stepXPx,
      stepYPx: metrics.stepYPx,
      maxRows,
    });
  }

  function onResizeMove(params: {
    axis: "x" | "y";
    clientX: number;
    clientY: number;
  }) {
    resizeController.onResizeMove(params);
  }

  function endResize() {
    const rowStepPx = DEFAULT_ROW_HEIGHT_PX + DEFAULT_GRID_GAP_PX;
    const maxRows = getSlideMaxRows({ rowStepPx });
    if (!maxRows) return;

    resizeController.endResize({ maxRows });
  }

  const theme = getSlideTheme(activeSlide.themeId as SlideTheme["id"]);

  const themeVars = {
    ["--editor-bg"]: theme.editorBg,
    ["--slide-bg"]: theme.slideBg,
    ["--slide-surface"]: theme.surface,
    ["--slide-text"]: theme.text,
    ["--slide-muted"]: theme.muted,
    ["--slide-accent"]: theme.accent,
    ["--slide-gridLine"]: theme.gridLine,
    ["--grid-cols"]: SLIDE_COLS,
    ["--grid-gap"]: `${DEFAULT_GRID_GAP_PX}px`,
    ["--row-step"]: `${DEFAULT_ROW_HEIGHT_PX + DEFAULT_GRID_GAP_PX}px`,
  } as CSSVars;

  useLayoutEffect(() => {
    if (mode !== "public") return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        actions.nextSlide();
      }

      if (e.key === "ArrowLeft") {
        actions.prevSlide();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, mode]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-black w-full" style={themeVars}>
        {mode === "edit" && (
          <AppTopBar
            className="text-white"
            onEnterPublic={() => setMode("public")}
          >
            <EditableTitle
              title={deck.title ?? "Untitled Deck"}
              onChange={actions.setDeckTitle}
            />
          </AppTopBar>
        )}

        <div
          className={cn("flex w-full h-full text-[color:var(--slide-text)]")}
        >
          {mode === "edit" && (
            <SlidesSidebar
              deck={deck}
              onSelectSlide={actions.setActiveSlideId}
              onAddSlide={() => {
                actions.addSlide({ themeId: activeSlide.themeId });
              }}
              onReorderSlides={actions.reorderSlides}
            />
          )}

          {message && (
            <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full border bg-background/90 px-3 py-1 text-xs font-medium shadow">
              {message}
            </div>
          )}

          {mode === "public" && (
            <div className="fixed right-4 top-4 z-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("edit")}
                >
                  <Undo2 />
                  Back
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.prevSlide()}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.nextSlide()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          <SlideCanvas
            mode={mode}
            setViewportEl={(el) => {
              viewportRef.current = el;
            }}
            setGridEl={(el) => {
              gridRef.current = el;
            }}
            slideCols={SLIDE_COLS}
            rowHeightPx={DEFAULT_ROW_HEIGHT_PX}
            gridGapPx={DEFAULT_GRID_GAP_PX}
            sensors={dndController.sensors}
            onDragStart={(event: DragStartEvent) => {
              const m = getGridMetricsForDrag();
              if (!m) return;

              const activeRect = event.active.rect.current?.initial;
              const overlayRect = activeRect
                ? { width: activeRect.width, height: activeRect.height }
                : null;

              dndController.onDragStart(event, {
                rowStepPx: m.rowStepPx,
                colWidthPx: m.colWidthPx,
                maxRows: m.maxRows,
                overlayRect,
              });
            }}
            onDragMove={(event: DragMoveEvent) => {
              dndController.onDragMove(event);
            }}
            onDragEnd={(event: DragEndEvent) => {
              const m = getGridMetricsForDrag();
              if (!m) return;

              dndController.onDragEnd(event, {
                rowStepPx: m.rowStepPx,
                colWidthPx: m.colWidthPx,
                maxRows: m.maxRows,
              });
            }}
            overlayModifiers={dndController.overlayModifiers}
            overlayBlock={
              dndController.activeDragId
                ? activeSlide.blocks.find(
                    (b) => b.id === dndController.activeDragId
                  ) ?? null
                : null
            }
            overlayWidthPx={dndController.overlayRect?.width ?? null}
            overlayHeightPx={dndController.overlayRect?.height ?? null}
          >
            {dndController.dragPreview && (
              <div
                className="rounded-xl border border-dashed border-[color:var(--slide-gridLine)] bg-[color:var(--slide-surface)]/50"
                style={{
                  gridColumn: `${dndController.dragPreview.colStart} / span ${dndController.dragPreview.colSpan}`,
                  gridRow: `${dndController.dragPreview.rowStart} / span ${dndController.dragPreview.rowSpan}`,
                  zIndex: 2,
                }}
              />
            )}

            {activeSlide.blocks.map((b) => (
              <DraggableBlock
                key={b.id}
                block={b}
                isEditable={mode === "edit"}
                getDragMetrics={() => dndController.getDragMetricsForBlocks()}
                hidden={dndController.dragPreview?.blockId === b.id}
                onContentChange={(next) =>
                  actions.updateBlock(b.id, (prev) => ({
                    ...prev,
                    content: next,
                  }))
                }
                onResizeStart={(axis, clientX, clientY) =>
                  startResize({ blockId: b.id, axis, clientX, clientY })
                }
                onResizeMove={(axis, clientX, clientY) =>
                  onResizeMove({ axis, clientX, clientY })
                }
                onResizeEnd={() => endResize()}
              />
            ))}
          </SlideCanvas>

          <BlockPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={addBlock}
          />
          {mode === "edit" && (
            <>
              <RightControlRail
                activeThemeId={activeSlide.themeId as SlideTheme["id"]}
                onThemeChange={(id) =>
                  actions.updateActiveSlide((s) => ({ ...s, themeId: id }))
                }
                onAddBlock={(type: "text" | "image" | "chart") => {
                  const blockType = type === "image" ? "media" : type;
                  addBlock(blockType as BlockType);
                }}
              />
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function makeDemoSlide(): Slide {
  return {
    id: "slide_1",
    title: "Slide 1",
    themeId: "dark-editorial",
    blocks: resolveCollisions([
      {
        id: "b_heading",
        content: { type: "heading", text: "Q4 Growth is Back" },
        position: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
      },
      {
        id: "b_stat",
        content: { type: "stat", label: "Net revenue", value: "$1.2M" },
        position: { colStart: 1, colSpan: 4, rowStart: 3, rowSpan: 3 },
      },
      {
        id: "b_text",
        content: {
          type: "text",
          text: "A tight layout system helps keep editorial slides consistent across different narratives.",
        },
        position: { colStart: 5, colSpan: 8, rowStart: 3, rowSpan: 4 },
      },
      {
        id: "b_chart",
        content: { type: "chart", title: "Active users (placeholder)" },
        position: { colStart: 1, colSpan: 7, rowStart: 7, rowSpan: 7 },
      },
      {
        id: "b_media",
        content: { type: "media", caption: "Product screenshot (placeholder)" },
        position: { colStart: 8, colSpan: 5, rowStart: 7, rowSpan: 7 },
      },
    ]),
  };
}

function makeDemoDeck(): Deck {
  const s1 = makeDemoSlide();
  const s2: Slide = {
    id: "slide_2",
    title: "Slide 2",
    themeId: "midnight",
    blocks: resolveCollisions([
      {
        id: "b2_heading",
        content: { type: "heading", text: "Editorial System" },
        position: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
      },
      {
        id: "b2_text",
        content: {
          type: "text",
          text: "Multiple slides with consistent layout, snapping, and bounds-aware normalization.",
        },
        position: { colStart: 1, colSpan: 7, rowStart: 3, rowSpan: 5 },
      },
      {
        id: "b2_stat",
        content: { type: "stat", label: "Slides", value: "2" },
        position: { colStart: 8, colSpan: 5, rowStart: 3, rowSpan: 3 },
      },
    ]),
  };

  return {
    slides: [s1, s2],
    activeSlideId: s1.id,
  };
}
