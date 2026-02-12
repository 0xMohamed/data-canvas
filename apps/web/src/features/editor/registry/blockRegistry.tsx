import type { ComponentType, ReactNode } from "react";
import type { EditorBlock } from "../models/editorTypes";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { ChartBlock } from "./blocks/ChartBlock";
import { TableBlock } from "./blocks/TableBlock";

type BlockRendererProps = {
  block: EditorBlock;
  selected: boolean;
  onChange: (content: unknown) => void;
};

const registry: Record<string, ComponentType<BlockRendererProps>> = {
  text: TextBlock,
  heading: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  chart: ChartBlock,
  table: TableBlock,
};

export function getBlockRenderer(type: string): ComponentType<BlockRendererProps> | null {
  return registry[type] ?? null;
}

export function renderBlock(
  block: EditorBlock,
  selected: boolean,
  onChange: (content: unknown) => void
): ReactNode {
  const Component = getBlockRenderer(block.type);
  if (!Component) {
    return (
      <div className="text-xs text-[color:var(--slide-muted)]">
        Unknown: {block.type}
      </div>
    );
  }
  return <Component block={block} selected={selected} onChange={onChange} />;
}
