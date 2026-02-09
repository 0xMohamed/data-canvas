import React, { useRef } from "react";

type ResizeAxis = "x" | "y";

export type ResizeStartInfo = {
  axis: ResizeAxis;
  clientX: number;
  clientY: number;
};

export type ResizeMoveInfo = {
  axis: ResizeAxis;
  clientX: number;
  clientY: number;
};

export type ResizeEndInfo = {
  axis: ResizeAxis;
};

type ResizableBlockProps = {
  children: React.ReactNode;
  onResizeStart: (info: ResizeStartInfo) => void;
  onResizeMove: (info: ResizeMoveInfo) => void;
  onResizeEnd: (info: ResizeEndInfo) => void;
};

export function ResizableBlock(props: ResizableBlockProps) {
  const stateRef = useRef<{ axis: ResizeAxis } | null>(null);

  function onPointerDown(axis: ResizeAxis) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      stateRef.current = { axis };
      props.onResizeStart({ axis, clientX: e.clientX, clientY: e.clientY });
    };
  }

  function onPointerMove(axis: ResizeAxis) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      if (!stateRef.current) return;
      props.onResizeMove({ axis, clientX: e.clientX, clientY: e.clientY });
    };
  }

  function onPointerUp(axis: ResizeAxis) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      if (!stateRef.current) return;
      stateRef.current = null;
      props.onResizeEnd({ axis });
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    };
  }

  return (
    <div className="relative h-full">
      {props.children}

      <div
        role="presentation"
        className="absolute -right-1 top-0 h-full w-3 cursor-ew-resize"
        onPointerDown={onPointerDown("x")}
        onPointerMove={onPointerMove("x")}
        onPointerUp={onPointerUp("x")}
      />
      <div
        role="presentation"
        className="absolute -bottom-1 left-0 h-3 w-full cursor-ns-resize"
        onPointerDown={onPointerDown("y")}
        onPointerMove={onPointerMove("y")}
        onPointerUp={onPointerUp("y")}
      />
    </div>
  );
}
