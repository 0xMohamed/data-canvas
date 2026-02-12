import type { EditorBlock } from "../../models/editorTypes";

export function VideoBlock(_props: {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--slide-gridLine)] bg-white/5 h-24 flex items-center justify-center">
      <span className="text-xs text-[color:var(--slide-muted)]">Video</span>
    </div>
  );
}
