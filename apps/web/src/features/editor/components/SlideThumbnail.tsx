import type { CSSProperties } from "react";

import type { Slide } from "../model/types";
import { DEFAULT_GRID_GAP_PX, DEFAULT_ROW_HEIGHT_PX } from "../model/layout";
import { getSlideTheme, type SlideTheme } from "../theme";
import { cn } from "@/lib/utils";
import {
  blockBodyClass,
  blockHeaderClass,
  blockShellClass,
} from "./blockClasses";
import { BlockPreviewContent } from "./BlockPreviewContent";

const SLIDE_COLS = 12;

type CSSVars = CSSProperties & Record<`--${string}`, string>;

export function SlideThumbnail(props: { slide: Slide }) {
  const theme = getSlideTheme(props.slide.themeId as SlideTheme["id"]);

  const themeVars = {
    ["--slide-bg"]: theme.slideBg,
    ["--slide-surface"]: theme.surface,
    ["--slide-text"]: theme.text,
    ["--slide-muted"]: theme.muted,
    ["--slide-accent"]: theme.accent,
    ["--slide-gridLine"]: theme.gridLine,
  } as CSSVars;

  return (
    <div className="relative" style={themeVars}>
      {/* <div className="h-[72px] w-full" /> */}
      <div
        // className="absolute left-0 top-0 origin-top-left"
        style={{
          width: "1400px",
          transform: "scale(0.0826873)",
          transformOrigin: "0px 0px",
          height: "66.67px",
        }}
      >
        <div
          className={cn(
            "relative overflow-hidden border bg-[var(--slide-bg)] text-[color:var(--slide-text)]"
          )}
          style={{
            padding: 16,
            boxSizing: "border-box",
            borderColor: "var(--slide-gridLine)",
          }}
        >
          <div
            className="grid content-start"
            style={{
              gridTemplateColumns: `repeat(${SLIDE_COLS}, minmax(0, 1fr))`,
              gridAutoRows: `${DEFAULT_ROW_HEIGHT_PX}px`,
              gap: DEFAULT_GRID_GAP_PX,
            }}
          >
            {props.slide.blocks.map((b) => (
              <div
                key={b.id}
                style={{
                  gridColumn: `${b.position.colStart} / span ${b.position.colSpan}`,
                  gridRow: `${b.position.rowStart} / span ${b.position.rowSpan}`,
                }}
              >
                <div className={blockShellClass}>
                  <div className={blockHeaderClass}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider">
                      {b.content.type}
                    </div>
                  </div>
                  <div className={blockBodyClass}>
                    <BlockPreviewContent content={b.content} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
