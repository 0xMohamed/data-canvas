import type { EditorBlock } from "../../models/editorTypes";

type ChartContent = { title?: string };

export function ChartBlock(props: {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
}) {
  const content = (props.block.content ?? {}) as ChartContent;

  return (
    <div>
      <div className="text-sm font-semibold">{content.title ?? "Chart"}</div>
      <div className="mt-2 h-24 rounded-lg border border-dashed border-[color:var(--slide-gridLine)] bg-white/5" />
    </div>
  );
}
