import { Eye, Grid2x2, Plus } from "lucide-react";

import type { SlideTheme } from "../theme";
import { ThemeSwitcher } from "../theme";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SlideToolbar(props: {
  themeId: SlideTheme["id"];
  onThemeChange: (id: SlideTheme["id"]) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onAddBlock: () => void;
  onEnterPublic: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--slide-gridLine)] bg-[var(--editor-bg)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-tight">
            Slide Editor
          </div>
          <Separator orientation="vertical" className="h-5" />
          <Button size="sm" onClick={props.onAddBlock}>
            <Plus />
            Add block
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher value={props.themeId} onChange={props.onThemeChange} />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={props.showGrid ? "secondary" : "outline"}
                size="sm"
                onClick={props.onToggleGrid}
              >
                <Grid2x2 />
                Grid
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle grid overlay</TooltipContent>
          </Tooltip>

          <Button variant="outline" size="sm" onClick={props.onEnterPublic}>
            <Eye />
            Public
          </Button>
        </div>
      </div>
    </div>
  );
}
