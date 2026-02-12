import type { EditorBlock } from "../../models/editorTypes";

type TextContent = { text?: string };

export function TextBlock(props: {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
}) {
  const content = (props.block.content ?? {}) as TextContent;
  const text = content.text ?? "";

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="min-h-[1.5em] outline-none focus:outline-none text-sm leading-relaxed text-[color:var(--slide-text)]/90"
      onBlur={(e) => {
        const next = (e.currentTarget.textContent ?? "").trim();
        props.onChange({ ...content, text: next });
      }}
    >
      {text}
    </div>
  );
}
