import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";

import type { BlockBase, BlockContent } from "../model/types";
import { ResizableBlock } from "./ResizableBlock";
import { BlockView } from "./BlockView";
import { cn } from "@/lib/utils";
import {
  blockBodyClass,
  blockHeaderClass,
  blockShellClass,
  dragPillClass,
} from "./blockClasses";

export function DraggableBlock(props: {
  block: BlockBase;
  isEditable: boolean;
  getDragMetrics: () => { rowStepPx: number; maxRows: number } | null;
  hidden?: boolean;
  onContentChange: (next: BlockContent) => void;
  onResizeStart: (axis: "x" | "y", clientX: number, clientY: number) => void;
  onResizeMove: (axis: "x" | "y", clientX: number, clientY: number) => void;
  onResizeEnd: (axis: "x" | "y") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.block.id,
      disabled: !props.isEditable,
    });

  let transformY = transform?.y;
  if (isDragging && typeof transformY === "number") {
    const metrics = props.getDragMetrics();
    if (metrics) {
      const minRowStart = 1;
      const maxRowStart = Math.max(
        1,
        metrics.maxRows - props.block.position.rowSpan + 1
      );
      const minDeltaRows = minRowStart - props.block.position.rowStart;
      const maxDeltaRows = maxRowStart - props.block.position.rowStart;
      const minDeltaPx = minDeltaRows * metrics.rowStepPx;
      const maxDeltaPx = maxDeltaRows * metrics.rowStepPx;
      transformY = Math.max(minDeltaPx, Math.min(transformY, maxDeltaPx));
    }
  }

  const style: CSSProperties = {
    gridColumn: `${props.block.position.colStart} / span ${props.block.position.colSpan}`,
    gridRow: `${props.block.position.rowStart} / span ${props.block.position.rowSpan}`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transformY ?? transform.y}px, 0)`
      : undefined,
    transition: isDragging ? undefined : "transform 120ms ease",
    zIndex: isDragging ? 30 : 1,
    opacity: props.hidden ? 0 : undefined,
    pointerEvents: props.hidden ? "none" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ResizableBlock
        onResizeStart={({ axis, clientX, clientY }) =>
          props.onResizeStart(axis, clientX, clientY)
        }
        onResizeMove={({ axis, clientX, clientY }) =>
          props.onResizeMove(axis, clientX, clientY)
        }
        onResizeEnd={({ axis }) => props.onResizeEnd(axis)}
      >
        <div className={cn(blockShellClass, isDragging && "shadow-2xl")}>
          {/* <div
            className={cn(
              blockHeaderClass,
              props.isEditable ? "cursor-grab select-none" : ""
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider">
              {props.block.content.type}
            </div>
            {props.isEditable && (
              <div {...listeners} {...attributes} className={dragPillClass}>
                Drag
              </div>
            )}
          </div> */}

          <div className={blockBodyClass}>
            <BlockView
              block={props.block}
              onContentChange={props.onContentChange}
            />
          </div>
        </div>
      </ResizableBlock>
    </div>
  );
}
