import { useRef, useState, useCallback } from "react";
import { useEditorStore } from "../state/editor.store";
import { renderBlock } from "../registry/blockRegistry";
import type { EditorBlock } from "../models/editorTypes";
import { cn } from "@/lib/utils";
import { scheduleSaveAfterTyping, saveOnDragEnd } from "../state/autosave";

export function BlockView(props: { block: EditorBlock; slideId: string }) {
  const { block } = props;
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const isDragging = useEditorStore((s) => s.isDragging);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const setDragging = useEditorStore((s) => s.setDragging);
  const commitMove = useEditorStore((s) => s.commitMove);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pointerStartRef = useRef<{ clientX: number; clientY: number; blockX: number; blockY: number } | null>(null);

  const selected = selectedBlockId === block.id;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      selectBlock(block.id);
      pointerStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        blockX: block.x,
        blockY: block.y,
      };
      setTranslate({ x: 0, y: 0 });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [block.id, block.x, block.y, selectBlock]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStartRef.current;
      if (!start) return;
      setDragging(true);
      const dx = e.clientX - start.clientX;
      const dy = e.clientY - start.clientY;
      setTranslate({ x: dx, y: dy });
    },
    [setDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      const start = pointerStartRef.current;
      if (!start) return;
      setDragging(false);
      pointerStartRef.current = null;
      const dx = e.clientX - start.clientX;
      const dy = e.clientY - start.clientY;
      const newX = Math.round(start.blockX + dx);
      const newY = Math.round(start.blockY + dy);
      pushHistoryCheckpoint();
      commitMove(block.id, newX, newY);
      setTranslate({ x: 0, y: 0 });
      saveOnDragEnd();
    },
    [block.id, commitMove, pushHistoryCheckpoint, setDragging]
  );

  const handleContentChange = useCallback(
    (content: unknown) => {
      pushHistoryCheckpoint();
      updateBlockContent(block.id, content);
      scheduleSaveAfterTyping();
    },
    [block.id, updateBlockContent, pushHistoryCheckpoint]
  );

  return (
    <div
      className={cn(
        "absolute min-w-[120px] rounded-xl border bg-[color:var(--slide-surface)] p-3 shadow-sm cursor-grab active:cursor-grabbing",
        selected && !isDragging && "ring-2 ring-[color:var(--slide-accent)]"
      )}
      style={{
        left: block.x,
        top: block.y,
        transform: translate.x || translate.y ? `translate(${translate.x}px, ${translate.y}px)` : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={(e) => {
        if (pointerStartRef.current && e.buttons === 0) {
          setDragging(false);
          pointerStartRef.current = null;
        }
      }}
    >
      <div
        className="pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {renderBlock(block, selected, handleContentChange)}
      </div>
    </div>
  );
}
