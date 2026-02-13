import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function ResizeHandle(props: {
  onDeltaPercent: (deltaPercent: number) => { clamped?: boolean; actualDelta?: number } | boolean | void;
  disabled?: boolean;
}) {
  const { onDeltaPercent, disabled } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const originXRef = useRef<number | null>(null);
  const totalAppliedDeltaRef = useRef<number>(0);
  const lastTotalDeltaPercentRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(1);
  const rafIdRef = useRef<number | null>(null);
  const lastMoveEventRef = useRef<PointerEvent | null>(null);

  const [dragging, setDragging] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    if (!dragging) return;

    const containerWidth = Math.max(1, containerWidthRef.current);

    const originX = originXRef.current;
    if (originX === null) return;

    const runFrame = () => {
      rafIdRef.current = null;
      const e = lastMoveEventRef.current;
      if (!e) return;

      const totalDx = e.clientX - originX;
      const totalDeltaPercent = (totalDx / containerWidth) * 100;
      const incremental = totalDeltaPercent - lastTotalDeltaPercentRef.current;
      lastTotalDeltaPercentRef.current = totalDeltaPercent;

      if (incremental === 0) return;

      const res = onDeltaPercent(incremental);
      const didClamp =
        typeof res === "boolean" ? res : typeof res === "object" ? Boolean(res?.clamped) : false;
      const applied = typeof res === "object" ? res?.actualDelta ?? incremental : incremental;
      totalAppliedDeltaRef.current += applied;
      setClamped(didClamp);
    };

    const onMove = (e: PointerEvent) => {
      lastMoveEventRef.current = e;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(runFrame);
    };

    const onUp = () => {
      setDragging(false);
      setClamped(false);
      originXRef.current = null;
      totalAppliedDeltaRef.current = 0;
      lastTotalDeltaPercentRef.current = 0;
      lastMoveEventRef.current = null;
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (totalAppliedDeltaRef.current !== 0) {
          onDeltaPercent(-totalAppliedDeltaRef.current);
        }
        onUp();
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [dragging, onDeltaPercent]);

  return (
    <div
      ref={ref}
      className={cn(
        "group/handle relative w-3.5 -mx-[7px] h-full left-1.5",
        disabled
          ? "pointer-events-none opacity-50"
          : "cursor-col-resize hover:cursor-col-resize",
      )}
      onPointerDown={(e) => {
        if (disabled) return;
        if (e.button !== 0) return;

        originXRef.current = e.clientX;
        totalAppliedDeltaRef.current = 0;
        lastTotalDeltaPercentRef.current = 0;
        const el = ref.current;
        const rowEl = el?.closest("[data-layout-row]") as HTMLElement | null;
        const rect = rowEl?.getBoundingClientRect();
        containerWidthRef.current = Math.max(1, rect?.width ?? 1);

        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 -translate-x-1/2",
          "w-1 rounded-full transition-[background-color,opacity,transform,shadow] duration-150",
          "opacity-0 group-hover/row:opacity-100",
          dragging && "opacity-100",
          !clamped && "bg-white/20",
          !clamped && "group-hover/handle:bg-[color:var(--accent)]/70",
          !clamped && "group-hover/handle:shadow-[0_0_18px_rgba(99,102,241,0.45)]",
          !clamped && dragging && "bg-[color:var(--accent)]/90 w-1",
          clamped && "bg-red-500/80 opacity-100 scale-x-110 shadow-[0_0_18px_rgba(239,68,68,0.35)]",
        )}
      />
    </div>
  );
}
