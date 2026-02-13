import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "../../state/editor.store";
import { LayoutRowView } from "./LayoutRowView";
import { LayoutBlockView } from "./LayoutBlockView";
import { scheduleSaveAfterTyping } from "../../state/autosave";
import { useEditorDnd } from "../state/editorDnd";

function RowDraggable(props: { rowId: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: props.rowId,
      data: { kind: "row" },
    });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative group/row",
        "transition-[opacity] duration-150",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={cn(
          "group/handle",
          "absolute -left-1.5 top-1/2 -translate-x-full -translate-y-1/2",
          "w-6 rounded-lg py-2",
          "border border-white/10 bg-black/35 backdrop-blur",
          "shadow-[0_1px_0_rgba(255,255,255,0.06),0_10px_22px_rgba(0,0,0,0.35)]",
          "hover:bg-black/45 hover:shadow-[0_1px_0_rgba(255,255,255,0.08),0_14px_30px_rgba(0,0,0,0.45),0_0_18px_rgba(99,102,241,0.25)]",
          "cursor-grab active:cursor-grabbing",
          "flex items-center justify-center",
          "transition-[opacity,transform,background-color] duration-150",
          "opacity-0 group-hover/row:opacity-100",
          isDragging && "opacity-100",
        )}
        {...attributes}
        {...listeners}
        aria-label="Drag row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center flex-col gap-1">
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
        </div>
      </button>
      {props.children}
    </div>
  );
}

function BlockDraggable(props: { blockId: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: props.blockId,
    data: { kind: "block" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative min-w-0 group/block",
        "transition-[opacity] duration-150",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={cn(
          "group/handle",
          "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2",
          "h-6 px-2 rounded-lg",
          "border border-white/10 bg-black/40 backdrop-blur",
          "shadow-[0_1px_0_rgba(255,255,255,0.06),0_12px_24px_rgba(0,0,0,0.35)]",
          "hover:bg-black/50 hover:shadow-[0_1px_0_rgba(255,255,255,0.08),0_16px_32px_rgba(0,0,0,0.45),0_0_18px_rgba(99,102,241,0.25)]",
          "cursor-grab active:cursor-grabbing",
          "flex items-center justify-center",
          "transition-[opacity,transform,background-color] duration-150",
          "opacity-0 group-hover/block:opacity-100",
          isDragging && "opacity-100",
        )}
        {...attributes}
        {...listeners}
        aria-label="Drag block"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
          <div className="h-1 w-1 rounded-full bg-white/45 group-hover/handle:bg-[color:var(--accent)]" />
        </div>
      </button>
      {props.children}
    </div>
  );
}

export function SlideLayoutView(props: { slideId: string }) {
  const slide = useEditorStore((s) =>
    s.snapshot.slides.find((x) => x.id === props.slideId),
  );
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const { registerRowRef, registerBlockRef } = useEditorDnd();
  const updateLayoutBlockContent = useEditorStore(
    (s) => (s as any).updateLayoutBlockContent,
  ) as
    | ((params: { slideId: string; blockId: string; content: unknown }) => void)
    | undefined;
  const resizeRow = useEditorStore((s) => (s as any).resizeLayoutRowDivider) as
    | ((params: {
        slideId: string;
        rowId: string;
        dividerIndex: number;
        deltaPercent: number;
      }) => { clamped?: boolean; actualDelta?: number } | boolean | void)
    | undefined;

  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);

  const isAnyDragging = useEditorStore((s) => s.isDragging);

  if (!slide) return null;

  return (
    <div className={cn("flex flex-col gap-4", "w-full")}>
      {slide.rows.map((row, rowIndex) => {
        return (
          <RowDraggable key={row.id} rowId={row.id}>
            <div
              ref={(el) => {
                registerRowRef(rowIndex, el);
              }}
              className={cn("relative", isAnyDragging && "pointer-events-none")}
            >
              <LayoutRowView
                row={row}
                onResizeDivider={(dividerIndex, deltaPercent) => {
                  if (!resizeRow) return;
                  return resizeRow({
                    slideId: slide.id,
                    rowId: row.id,
                    dividerIndex,
                    deltaPercent,
                  });
                }}
              >
                {row.blocks.map((block, blockIndex) => (
                  <div
                    key={block.id}
                    ref={(el) => {
                      registerBlockRef(rowIndex, blockIndex, el);
                    }}
                    className="min-w-0"
                  >
                    <BlockDraggable blockId={block.id}>
                      <LayoutBlockView
                        block={block}
                        selected={selectedBlockId === block.id}
                        onSelect={() => selectBlock(block.id)}
                        onChange={(content) => {
                          if (!updateLayoutBlockContent) return;
                          pushHistoryCheckpoint();
                          updateLayoutBlockContent({
                            slideId: slide.id,
                            blockId: block.id,
                            content,
                          });
                          scheduleSaveAfterTyping();
                        }}
                      />
                    </BlockDraggable>
                  </div>
                ))}
              </LayoutRowView>
            </div>
          </RowDraggable>
        );
      })}
    </div>
  );
}
