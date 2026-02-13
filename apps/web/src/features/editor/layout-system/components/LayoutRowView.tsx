import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { LayoutRow } from "../types";
import { ResizeHandle } from "./ResizeHandle";

export function LayoutRowView(props: {
  row: LayoutRow;
  onResizeDivider: (
    dividerIndex: number,
    deltaPercent: number,
  ) => { clamped?: boolean; actualDelta?: number } | boolean | void;
  children: React.ReactNode;
}) {
  const { row } = props;

  const templateColumns = useMemo(() => {
    if (row.blocks.length === 0) return "1fr";
    return row.widths.map((w) => `minmax(0, ${w}%)`).join(" ");
  }, [row.blocks.length, row.widths]);

  return (
    <div
      data-layout-row
      className={cn("relative w-full min-w-0")}
      style={{
        display: "grid",
        gridTemplateColumns: templateColumns,
        gap: 12,
        alignItems: "stretch",
      }}
    >
      {props.children}

      {row.blocks.length > 1 ? (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          aria-hidden
          style={{
            display: "grid",
            gridTemplateColumns: templateColumns,
            gap: 12,
            alignItems: "stretch",
          }}
        >
          {row.blocks.slice(0, -1).map((_, i) => (
            <div
              key={`divider_${row.id}_${i}`}
              className="pointer-events-auto"
              style={{
                gridColumn: i + 1,
                gridRow: 1,
                justifySelf: "end",
                height: "100%",
              }}
            >
              <ResizeHandle
                onDeltaPercent={(delta) => props.onResizeDivider(i, delta)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
