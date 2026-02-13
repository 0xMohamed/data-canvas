import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useEditorStore } from "../../state/editor.store";
import { scheduleSaveAfterStructural } from "../../state/autosave";
import { pickDropTarget, type DropTarget } from "../utils/dnd";
import { LayoutBlockView } from "../components/LayoutBlockView";

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

    // Temporary debug logs (requested)
    // eslint-disable-next-line no-console
    console.log("[dnd] dropTarget", target);
    // eslint-disable-next-line no-console
    console.log("[dnd] indicatorRect", rect);

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

  const onDragStart = (e: DragStartEvent) => {
    closeToolbarsRef.current();

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

  const onDragEnd = (_e: DragEndEvent) => {
    if (!activeDrag || !dropTarget) {
      setActiveDrag(null);
      setDropTarget(null);
      setIndicatorRect(null);
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

    setActiveDrag(null);
    setDropTarget(null);
    setIndicatorRect(null);
  };

  const overlay = (() => {
    if (!activeDrag) return null;

    if (activeDrag.kind === "block") {
      const block = slide?.rows
        .flatMap((r) => r.blocks)
        .find((b) => b.id === activeDrag.blockId);
      if (!block) return null;

      return (
        <div style={{ width: 320, maxWidth: "40vw" }}>
          <LayoutBlockView
            block={block}
            selected={false}
            onSelect={() => undefined}
            onChange={() => undefined}
          />
        </div>
      );
    }

    if (activeDrag.kind === "row") {
      return (
        <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md px-3 py-2 text-sm text-white shadow-xl">
          Row
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md px-3 py-2 text-sm text-white shadow-xl">
        {activeDrag.kind === "toolbar" ? activeDrag.blockType : null}
      </div>
    );
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
      >
        {props.children}
        <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
      </DndContext>
    </Ctx.Provider>
  );
}
