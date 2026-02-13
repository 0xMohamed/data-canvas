import {
  CaseSensitive,
  ChartSpline,
  Image,
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
import { forwardRef, type ReactNode, useEffect, useMemo, useState } from "react";
import { ToolbarDraggable } from "../layout-system/components/ToolbarDraggable";
import { useEditorDnd } from "../layout-system/state/editorDnd";

type RailIconButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  label: string;
  icon: ReactNode;
};

export const RailIconButton = forwardRef<
  HTMLButtonElement,
  RailIconButtonProps
>(({ label, icon, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      size="icon"
      className={cn(
        // ✅ match SlidesBar actions
        "inline-flex items-center justify-center",
        "h-9 w-9 rounded-lg",
        "bg-transparent",
        "border border-white/10",
        "text-[color:var(--text)]/70 hover:text-white",
        "hover:bg-white/5",
        "focus-visible:ring-2 focus-visible:ring-white/15",
        "cursor-pointer",
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
});

function DraggableCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left",
        "border border-white/10",
        // ✅ slightly more consistent with the rest of the UI
        "bg-white/[0.03] hover:bg-white/5",
        "text-[color:var(--text)]",
      )}
      title="Drag me into the slide"
    >
      <div className="mt-0.5 text-[color:var(--text)]/70">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {description ? (
          <div className="text-xs text-[color:var(--text)]/55 line-clamp-2">
            {description}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function MenuContent({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="px-1">
        <div className="text-xs font-medium text-[color:var(--text)]/70">
          {title}
        </div>
        {subtitle ? (
          <div className="text-xs text-[color:var(--text)]/50">{subtitle}</div>
        ) : null}
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

const popoverSurfaceClass = cn(
  "z-[60] w-72 p-2 rounded-2xl",
  // ✅ match SlidesBar material instead of being much darker
  "bg-black/40 backdrop-blur-md border border-white/10",
  "text-[color:var(--text)] shadow-xl",
);

export default function CanvasToolbar({
  activeThemeId,
  onThemeChange,
  onAddBlock,
}: {
  activeThemeId: SlideTheme["id"];
  onThemeChange: (id: SlideTheme["id"]) => void;
  onAddBlock: (type: "text" | "image" | "chart") => void;
}) {
  const { setCloseToolbars } = useEditorDnd();

  const [open, setOpen] = useState<
    | null
    | "blocks"
    | "images"
    | "charts"
    | "tables"
    | "layouts"
    | "theme"
  >(null);

  const closeAll = useMemo(() => () => setOpen(null), []);

  useEffect(() => {
    setCloseToolbars(closeAll);
  }, [closeAll, setCloseToolbars]);

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50">
      {/* ✅ مهم: overflow-visible عشان الـ popover يطلع برا */}
      <div
        className={cn(
          "overflow-visible",
          // ✅ match SlidesBar container
          "rounded-2xl border border-white/10",
          "bg-black/40 backdrop-blur-md",
          "shadow-lg",
          "p-2",
        )}
      >
        <div className="flex flex-col items-center gap-2">
          {/* BLOCKS */}
          <Popover open={open === "blocks"} onOpenChange={(v) => setOpen(v ? "blocks" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Blocks"
                icon={<CaseSensitive className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={popoverSurfaceClass}
            >
              <MenuContent
                title="Blocks"
                subtitle="Drag or click to add"
              >
                <ToolbarDraggable id="toolbar:text" blockType="text">
                  <DraggableCard
                    icon={<Type className="h-4 w-4" />}
                    title="Text — Paragraph"
                    description="Basic text block."
                    onClick={() => onAddBlock("text")}
                  />
                </ToolbarDraggable>

                <ToolbarDraggable id="toolbar:image" blockType="image">
                  <DraggableCard
                    icon={<Image className="h-4 w-4" />}
                    title="Image — Basic"
                    description="Single image block."
                    onClick={() => onAddBlock("image")}
                  />
                </ToolbarDraggable>

                <ToolbarDraggable id="toolbar:chart" blockType="chart">
                  <DraggableCard
                    icon={<ChartSpline className="h-4 w-4" />}
                    title="Chart — Basic"
                    description="Placeholder chart block."
                    onClick={() => onAddBlock("chart")}
                  />
                </ToolbarDraggable>
              </MenuContent>
            </PopoverContent>
          </Popover>

          {/* IMAGES */}
          <Popover open={open === "images"} onOpenChange={(v) => setOpen(v ? "images" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Images"
                icon={<Image className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={popoverSurfaceClass}
            >
              <MenuContent title="Images" subtitle="Drag or click to add">
                <DraggableCard
                  icon={<Image className="h-4 w-4" />}
                  title="Hero Image"
                  description="1920×1080 placeholder"
                />
                <DraggableCard
                  icon={<Image className="h-4 w-4" />}
                  title="Avatar"
                  description="Square placeholder"
                />
                <DraggableCard
                  icon={<Image className="h-4 w-4" />}
                  title="Logo"
                  description="Transparent placeholder"
                />
              </MenuContent>
            </PopoverContent>
          </Popover>

          {/* CHARTS */}
          <Popover open={open === "charts"} onOpenChange={(v) => setOpen(v ? "charts" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Charts"
                icon={<ChartSpline className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={popoverSurfaceClass}
            >
              <MenuContent
                title="Charts"
                subtitle="Drag or click to add"
              >
                <DraggableCard
                  icon={<ChartSpline className="h-4 w-4" />}
                  title="Line chart"
                  description="Trends over time."
                />
                <DraggableCard
                  icon={<ChartSpline className="h-4 w-4" />}
                  title="Bar chart"
                  description="Compare categories."
                />
              </MenuContent>
            </PopoverContent>
          </Popover>

          {/* TABLES */}
          <Popover open={open === "tables"} onOpenChange={(v) => setOpen(v ? "tables" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Tables"
                icon={<Table className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={popoverSurfaceClass}
            >
              <MenuContent
                title="Tables"
                subtitle="Drag or click to add"
              >
                <DraggableCard
                  icon={<Table className="h-4 w-4" />}
                  title="Simple table"
                  description="3×5 template."
                />
                <DraggableCard
                  icon={<Table className="h-4 w-4" />}
                  title="Pricing table"
                  description="3-tier layout."
                />
              </MenuContent>
            </PopoverContent>
          </Popover>

          {/* LAYOUTS */}
          <Popover open={open === "layouts"} onOpenChange={(v) => setOpen(v ? "layouts" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Layouts"
                icon={<LayoutGrid className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={popoverSurfaceClass}
            >
              <MenuContent
                title="Layouts"
                subtitle="Dummy sections (drag later)."
              >
                <DraggableCard
                  icon={<LayoutGrid className="h-4 w-4" />}
                  title="Hero section"
                  description="Title + subtitle + CTA."
                />
                <DraggableCard
                  icon={<LayoutGrid className="h-4 w-4" />}
                  title="Features grid"
                  description="3–6 cards."
                />
              </MenuContent>
            </PopoverContent>
          </Popover>

          {/* THEME */}
          <Popover open={open === "theme"} onOpenChange={(v) => setOpen(v ? "theme" : null)}>
            <PopoverTrigger asChild>
              <RailIconButton
                label="Theme"
                icon={<Palette className="h-5 w-5" />}
              />
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="center"
              sideOffset={12}
              className={cn(
                popoverSurfaceClass,
                "w-64", // keep the theme popover narrower
              )}
            >
              <MenuContent title="Theme" subtitle="Switch slide theme.">
                <Button
                  type="button"
                  variant={
                    activeThemeId === "light-editorial" ? "secondary" : "ghost"
                  }
                  size="sm"
                  onClick={() => onThemeChange("light-editorial")}
                  className="justify-start gap-2 rounded-xl"
                >
                  <div className="h-3 w-3 rounded-sm border border-gray-300 bg-white" />
                  Light
                </Button>

                <Button
                  type="button"
                  variant={
                    activeThemeId === "dark-editorial" ? "secondary" : "ghost"
                  }
                  size="sm"
                  onClick={() => onThemeChange("dark-editorial")}
                  className="justify-start gap-2 rounded-xl"
                >
                  <div className="h-3 w-3 rounded-sm border border-gray-600 bg-gray-900" />
                  Dark
                </Button>
              </MenuContent>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
