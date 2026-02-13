import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragCancelEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useEditorStore } from "../../state/editor.store";
import { scheduleSaveAfterStructural } from "../../state/autosave";
import { pickDropTarget, type DropTarget } from "../utils/dnd";
import { cn } from "@/lib/utils";

const MAX_BLOCKS_PER_ROW = 4;

type ActiveDrag =
  | { kind: "block"; blockId: string }
  | { kind: "toolbar"; paletteId: string; blockType: string }
  | { kind: "row"; rowId: string }
  | null;

type IndicatorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  axis: "horizontal" | "vertical";
} | null;

type DndApi = {
  registerRowRef: (rowIndex: number, el: HTMLDivElement | null) => void;
  registerBlockRef: (
    rowIndex: number,
    blockIndex: number,
    el: HTMLDivElement | null,
  ) => void;
  dropTarget: DropTarget | null;
  indicatorRect: IndicatorRect;
  activeDrag: ActiveDrag;
  closeToolbars: () => void;
  setCloseToolbars: (fn: () => void) => void;
};

const Ctx = createContext<DndApi | null>(null);

export function useEditorDnd() {
  const ctx = useContext(Ctx);

  if (!ctx)
    throw new Error("useEditorDnd must be used inside EditorDndProvider");
  return ctx;
}

export function EditorDndProvider(props: {
  slideId: string;
  children: React.ReactNode;
}) {
  const moveLayoutBlock = useEditorStore((s) => (s as any).moveLayoutBlock) as
    | ((params: {
        slideId: string;
        activeBlockId: string;
        target: DropTarget;
      }) => void)
    | undefined;
  const insertLayoutBlock = useEditorStore(
    (s) => (s as any).insertLayoutBlock,
  ) as
    | ((params: {
        slideId: string;
        block: { type: string; content: unknown };
        target: DropTarget;
      }) => void)
    | undefined;

  const moveLayoutRow = useEditorStore((s) => (s as any).moveLayoutRow) as
    | ((params: { slideId: string; activeRowId: string; target: DropTarget }) => void)
    | undefined;
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);

  const slide = useEditorStore((s) =>
    s.snapshot.slides.find((x) => x.id === props.slideId),
  );

  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect>(null);

  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blockRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);

  const closeToolbarsRef = useRef<() => void>(() => undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const clearDndState = () => {
    setActiveDrag(null);
    setDropTarget(null);
    setIndicatorRect(null);
  };

  const blocksCountByRow = useMemo(() => {
    return slide?.rows.map((r) => r.blocks.length) ?? [];
  }, [slide?.rows]);

  const registerRowRef = (rowIndex: number, el: HTMLDivElement | null) => {
    rowRefs.current[rowIndex] = el;
  };

  const registerBlockRef = (
    rowIndex: number,
    blockIndex: number,
    el: HTMLDivElement | null,
  ) => {
    if (!blockRefs.current[rowIndex]) blockRefs.current[rowIndex] = [];
    blockRefs.current[rowIndex][blockIndex] = el;
  };

  const computeDropTargetAtPoint = (point: { x: number; y: number }) => {
    const rowRects = rowRefs.current.map((el) =>
      el ? el.getBoundingClientRect() : null,
    );
    const blockRectsByRow = blockRefs.current.map((row) =>
      row.map((el) => (el ? el.getBoundingClientRect() : null)),
    );

    const mode: Parameters<typeof pickDropTarget>[0]["mode"] =
      activeDrag?.kind === "row"
        ? "row"
        : activeDrag?.kind === "toolbar"
          ? "toolbar"
          : "block";

    const target = pickDropTarget({
      mode,
      point,
      rowRects,
      blockRectsByRow,
      maxBlocksPerRow: MAX_BLOCKS_PER_ROW,
      blocksCountByRow,
    });

    const rect = computeIndicatorRect(target);

    setDropTarget(target);
    setIndicatorRect(rect);
  };

  const getDragPoint = (e: DragStartEvent | DragMoveEvent) => {
    const rect = e.active.rect.current.translated ?? e.active.rect.current.initial;
    if (!rect) return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const computeIndicatorRect = (target: DropTarget | null): IndicatorRect => {
    if (!target) return null;

    const rowEl = rowRefs.current[target.rowIndex];
    const rowRect = rowEl?.getBoundingClientRect();
    if (!rowRect) return null;

    if (target.kind === "new-row" || target.kind === "row-reorder") {
      const y = target.edge === "before" ? rowRect.top : rowRect.bottom;
      return {
        x: rowRect.left,
        y,
        width: rowRect.width,
        height: 3,
        axis: "horizontal",
      };
    }

    if (target.kind !== "in-row") return null;

    const blockEl = blockRefs.current[target.rowIndex]?.[target.blockIndex];
    const blockRect = blockEl?.getBoundingClientRect();
    if (!blockRect) return null;

    const x = target.edge === "before" ? blockRect.left : blockRect.right;
    return {
      x,
      y: rowRect.top,
      width: 3,
      height: rowRect.height,
      axis: "vertical",
    };
  };

  const setDragging = useEditorStore((s) => s.setDragging);

  const onDragStart = (e: DragStartEvent) => {
    closeToolbarsRef.current();
    setDragging(true);
    const id = String(e.active.id);
    const kind = e.active.data.current?.kind;

    if (kind === "toolbar") {
      const blockType = String(e.active.data.current?.blockType ?? "text");
      setActiveDrag({ kind: "toolbar", paletteId: id, blockType });
    } else if (kind === "row") {
      setActiveDrag({ kind: "row", rowId: id });
    } else {
      setActiveDrag({ kind: "block", blockId: id });
    }

    setDropTarget(null);
    setIndicatorRect(null);

    const point = getDragPoint(e);
    if (point) computeDropTargetAtPoint(point);
  };

  const onDragMove = (e: DragMoveEvent) => {
    const point = getDragPoint(e);
    if (!point) return;
    computeDropTargetAtPoint(point);
  };

  const onDragCancel = (_e: DragCancelEvent) => {
    setDragging(false);
    clearDndState();
  };

  const onDragEnd = (_e: DragEndEvent) => {
    setDragging(false);
    if (!activeDrag || !dropTarget) {
      clearDndState();
      return;
    }

    pushHistoryCheckpoint();

    if (activeDrag.kind === "block" && moveLayoutBlock) {
      moveLayoutBlock({
        slideId: props.slideId,
        activeBlockId: activeDrag.blockId,
        target: dropTarget,
      });
      scheduleSaveAfterStructural();
    }

    if (activeDrag.kind === "row" && moveLayoutRow) {
      moveLayoutRow({
        slideId: props.slideId,
        activeRowId: activeDrag.rowId,
        target: dropTarget,
      });
      scheduleSaveAfterStructural();
    }

    if (activeDrag.kind === "toolbar" && insertLayoutBlock) {
      insertLayoutBlock({
        slideId: props.slideId,
        block: {
          type: activeDrag.blockType,
          content: activeDrag.blockType === "text" ? { text: "" } : {},
        },
        target: dropTarget,
      });
      scheduleSaveAfterStructural();
    }

    clearDndState();
  };

  const BlockDragPreview = () => {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/10",
          "bg-[color:var(--slide-surface)]",
          "shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.55)]",
        )}
        style={{ width: 320, maxWidth: "40vw", height: 120 }}
      />
    );
  };

  const RowDragPreview = (p: { widths: number[]; blocksCount: number }) => {
    const templateColumns = p.widths.length
      ? p.widths.map((w) => `minmax(0, ${w}%)`).join(" ")
      : "1fr";

    return (
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-black/40 backdrop-blur-md",
          "shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.55)]",
          "p-3",
        )}
        style={{ width: 520, maxWidth: "60vw" }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: templateColumns, gap: 12 }}
        >
          {Array.from({ length: Math.max(1, p.blocksCount) }).map((_, i) => (
            <div
              key={`row_preview_${i}`}
              className={cn(
                "min-w-0 rounded-xl border border-white/10",
                "bg-[color:var(--slide-surface)]",
              )}
              style={{ height: 96 }}
            />
          ))}
        </div>
      </div>
    );
  };

  const overlay = (() => {
    if (!activeDrag) return null;

    if (activeDrag.kind === "block") {
      return <BlockDragPreview />;
    }

    if (activeDrag.kind === "row") {
      const row = slide?.rows.find((r) => r.id === activeDrag.rowId);
      if (!row) return null;
      return (
        <RowDragPreview
          widths={row.widths.length ? row.widths : row.blocks.map(() => 100 / Math.max(1, row.blocks.length))}
          blocksCount={row.blocks.length}
        />
      );
    }

    return <BlockDragPreview />;
  })();

  const value: DndApi = {
    registerRowRef,
    registerBlockRef,
    dropTarget,
    indicatorRect,
    activeDrag,
    closeToolbars: () => closeToolbarsRef.current(),
    setCloseToolbars: (fn) => {
      closeToolbarsRef.current = fn;
    },
  };

  return (
    <Ctx.Provider value={value}>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        {props.children}
        <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
      </DndContext>
    </Ctx.Provider>
  );
}
