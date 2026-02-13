import { cn } from '@/lib/utils';
import { renderBlock } from '../../registry/blockRegistry';
import type { LayoutBlock } from '../types';

export function LayoutBlockView(props: {
  block: LayoutBlock;
  selected: boolean;
  onSelect: () => void;
  onChange: (content: unknown) => void;
}) {
  const { block, selected, onSelect, onChange } = props;

  return (
    <div
      className={cn(
        'min-w-0 rounded-xl border bg-[color:var(--slide-surface)] p-3 shadow-sm',
        selected && 'ring-2 ring-[color:var(--slide-accent)]',
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="pointer-events-auto min-w-0">
        {renderBlock(
          { id: block.id, type: block.type, content: block.content },
          selected,
          onChange,
        )}
      </div>
    </div>
  );
}
