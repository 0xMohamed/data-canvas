import {
  CaseSensitive,
  ChartSpline,
  Image,
  Layout,
  LayoutGrid,
  Palette,
  Table,
  Type,
} from "lucide-react";
import type { SlideTheme } from "../theme";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function RightControlRail({
  activeThemeId,
  onThemeChange,
  onAddBlock,
}: {
  activeThemeId: SlideTheme["id"];
  onThemeChange: (id: SlideTheme["id"]) => void;
  onAddBlock: (type: "text" | "image" | "chart") => void;
}) {
  return (
    <div className="p-1 pr-4 flex-1 flex items-center justify-center flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <CaseSensitive className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBlock("text")}
              className="justify-start gap-2"
            >
              <Type className="h-4 w-4" />
              Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBlock("image")}
              className="justify-start gap-2"
            >
              <Image className="h-4 w-4" />
              Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBlock("chart")}
              className="justify-start gap-2"
            >
              <Layout className="h-4 w-4" />
              Chart
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <Image className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1"></div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <ChartSpline className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1"></div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <Table className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1"></div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <LayoutGrid className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1"></div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <Palette className="!size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="center" className="w-48 p-2">
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant={
                activeThemeId === "light-editorial" ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => onThemeChange("light-editorial")}
              className="justify-start gap-2"
            >
              <div className="h-3 w-3 rounded-sm border border-gray-300 bg-white" />
              Light
            </Button>
            <Button
              variant={
                activeThemeId === "dark-editorial" ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => onThemeChange("dark-editorial")}
              className="justify-start gap-2"
            >
              <div className="h-3 w-3 rounded-sm border border-gray-600 bg-gray-900" />
              Dark
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
