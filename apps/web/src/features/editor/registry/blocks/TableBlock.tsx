import type { EditorBlock } from "../../models/editorTypes";

export function TableBlock(_props: {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--slide-gridLine)] bg-white/5 p-4">
      <span className="text-xs text-[color:var(--slide-muted)]">Table</span>
    </div>
  );
}
