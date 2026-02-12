import type { EditorBlock } from "../../models/editorTypes";

type ImageContent = { url?: string; caption?: string };

export function ImageBlock(props: {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
}) {
  const content = (props.block.content ?? {}) as ImageContent;

  return (
    <div className="rounded-lg border border-[color:var(--slide-gridLine)] bg-white/5 overflow-hidden">
      <div className="aspect-video flex items-center justify-center bg-white/5">
        {content.url ? (
          <img src={content.url} alt="" className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-xs text-[color:var(--slide-muted)]">Image</span>
        )}
      </div>
      {content.caption != null && (
        <div className="px-2 py-1 text-xs text-[color:var(--slide-muted)]">
          {content.caption}
        </div>
      )}
    </div>
  );
}
