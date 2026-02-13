import { useEditorStore } from "../state/editor.store";
import { renderBlock } from "../registry/blockRegistry";
import type { EditorBlock } from "../models/editorTypes";
import { cn } from "@/lib/utils";
import { scheduleSaveAfterTyping } from "../state/autosave";

export function BlockView(props: { block: EditorBlock; slideId: string }) {
  const { block } = props;
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);

  const selected = selectedBlockId === block.id;

  const handleContentChange = (content: unknown) => {
    pushHistoryCheckpoint();
    updateBlockContent(block.id, content);
    scheduleSaveAfterTyping();
  };

  return (
    <div
      className={cn(
        "min-w-[120px] rounded-xl border bg-[color:var(--slide-surface)] p-3 shadow-sm",
        "cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-[color:var(--slide-accent)]"
      )}
      onPointerDown={() => selectBlock(block.id)}
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
