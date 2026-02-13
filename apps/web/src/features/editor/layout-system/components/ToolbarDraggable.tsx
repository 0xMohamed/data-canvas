import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function ToolbarDraggable(props: {
  id: string;
  blockType: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    data: { kind: 'toolbar', blockType: props.blockType },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}
