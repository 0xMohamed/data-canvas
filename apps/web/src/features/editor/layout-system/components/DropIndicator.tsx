import { cn } from '@/lib/utils';
import type { DropTarget } from '../utils/dnd';

export function DropIndicator(props: {
  target: DropTarget;
}) {
  const { target } = props;

  if (target.kind === 'new-row') {
    return (
      <div
        className={cn(
          'absolute left-0 right-0 h-[3px]',
          'bg-[color:var(--slide-accent)]/80',
          'rounded-full',
        )}
        style={{
          top: target.edge === 'before' ? 0 : undefined,
          bottom: target.edge === 'after' ? 0 : undefined,
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 w-[3px]',
        'bg-[color:var(--slide-accent)]/80',
        'rounded-full',
      )}
      style={{
        left: target.edge === 'before' ? 0 : undefined,
        right: target.edge === 'after' ? 0 : undefined,
      }}
    />
  );
}
