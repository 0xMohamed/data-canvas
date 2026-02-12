import { cn } from "@/lib/utils";
import { useEditorStore } from "../state/editor.store";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { scheduleSaveAfterStructural } from "../state/autosave";

type Slide = {
  id: string;
  title: string;
};

export function SortableSlideRow({
  slide,
  index,
  isActive,
  onSelect,
  onRemove,
  onRename,
}: {
  slide: Slide;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onRename: (nextTitle: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(slide.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) setDraft(slide.title);
  }, [slide.title, isEditing]);

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing]);

  const commit = () => {
    const next = draft.trim();
    setIsEditing(false);
    if (!next || next === slide.title) return;
    onRename(next);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(slide.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-lg cursor-pointer",
        "px-1",
        isActive ? "bg-[color:var(--accent)]/20" : "hover:bg-white/5",
        isDragging && "opacity-70",
      )}
      onClick={() => {
        if (!isEditing) onSelect();
      }}
    >
      <div className="w-7 h-7 grid place-items-center shrink-0">
        <span
          className={cn(
            "text-xs tabular-nums select-none",
            "text-[color:var(--text)]/60",
            "group-hover:hidden",
          )}
          title={`Slide ${index + 1}`}
        >
          {index + 1}
        </span>

        <button
          type="button"
          className={cn(
            "hidden group-hover:grid place-items-center",
            "cursor-grab active:cursor-grabbing select-none",
            "w-7 h-7 rounded-md",
            "text-[color:var(--text)]/60 hover:text-[color:var(--text)]",
            "hover:bg-white/5",
          )}
          aria-label="Reorder slide"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-w-0 py-2 pr-1">
        {!isEditing ? (
          <button
            type="button"
            className={cn(
              "w-full text-left text-sm truncate cursor-pointer",
              isActive ? "text-[color:var(--accent)]" : "",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Double click to rename"
          >
            {slide.title}
          </button>
        ) : (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "w-full bg-transparent text-sm outline-none rounded-md px-1",
              "ring-1 ring-white/15 focus:ring-2 focus:ring-[color:var(--accent)]/60",
              isActive ? "text-[color:var(--accent)]" : "",
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            onBlur={commit}
          />
        )}
      </div>

      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className={cn(
            "p-1 rounded-md cursor-pointer",
            "text-red-400 text-sm",
            "opacity-0 group-hover:opacity-100",
            "hover:bg-red-500/10",
          )}
          title="Remove slide"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function SlidesSidebar() {
  const snapshot = useEditorStore((s) => s.snapshot);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const setCurrentSlideId = useEditorStore((s) => s.setCurrentSlideId);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);
  const renameSlide = useEditorStore((s) => s.renameSlide);
  const addSlide = useEditorStore((s) => s.addSlide);
  const pushHistoryCheckpoint = useEditorStore((s) => s.pushHistoryCheckpoint);
  const isCollapsed = useEditorStore((s) => s.isSidebarCollapsed);
  const setIsCollapsed = useEditorStore((s) => s.setSidebarCollapse);

  const slides = snapshot.slides as Slide[];
  const slideIds = slides.map((s) => s.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    pushHistoryCheckpoint();
    reorderSlides(activeId, overId);
    scheduleSaveAfterStructural();
  };

  // ✅ Collapsed rail (minimal)
  if (isCollapsed) {
    return (
      <div className={cn("fixed left-3 top-1/2 -translate-y-1/2 z-50")}>
        <div
          className={cn(
            "rounded-2xl border border-white/10",
            "bg-black/40 backdrop-blur-md",
            "shadow-lg",
            "p-2",
            "w-12",
            "transition-all duration-200",
          )}
        >
          <div className="flex flex-col gap-2 items-center">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className={cn(
                "flex items-center justify-center",
                "w-8 h-8 rounded-lg",
                "border border-white/10 hover:bg-white/5",
                "text-[color:var(--text)]/70 hover:text-white",
                "cursor-pointer",
              )}
              title="Expand slides"
              aria-label="Expand slides"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                pushHistoryCheckpoint();
                addSlide();
                scheduleSaveAfterStructural();
              }}
              className={cn(
                "flex items-center justify-center",
                "w-8 h-8 rounded-lg",
                "border border-white/10 hover:bg-white/5",
                "text-[color:var(--text)]/70 hover:text-white",
                "cursor-pointer",
              )}
              title="Add new slide"
              aria-label="Add new slide"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Expanded panel
  return (
    <div
      className={cn(
        "fixed left-3 top-1/2 -translate-y-1/2 z-50",
        "w-40 transition-all duration-200",
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-white/10",
          "bg-black/40 backdrop-blur-md",
          "shadow-lg",
          "p-2",
        )}
      >
        {/* Top actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs text-[color:var(--text)]/60 select-none pl-2">
            Slides
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className={cn(
                "flex items-center justify-center",
                "w-8 h-8 rounded-lg",
                "border border-white/10 hover:bg-white/5",
                "text-[color:var(--text)]/70 hover:text-white",
                "cursor-pointer",
              )}
              title="Collapse"
              aria-label="Collapse slides"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                pushHistoryCheckpoint();
                addSlide();
                scheduleSaveAfterStructural();
              }}
              className={cn(
                "flex items-center justify-center",
                "w-8 h-8 rounded-lg",
                "border border-white/10 hover:bg-white/5",
                "text-[color:var(--text)]/70 hover:text-white",
                "cursor-pointer",
              )}
              title="Add new slide"
              aria-label="Add new slide"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={slideIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto overflow-x-hidden">
              {slides.map((slide, index) => (
                <SortableSlideRow
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={currentSlideId === slide.id}
                  onSelect={() => setCurrentSlideId(slide.id)}
                  onRemove={(e) => {
                    e.stopPropagation();
                    pushHistoryCheckpoint();
                    removeSlide(slide.id);
                    scheduleSaveAfterStructural();
                  }}
                  onRename={(nextTitle) => {
                    pushHistoryCheckpoint();
                    renameSlide(slide.id, nextTitle);
                    scheduleSaveAfterStructural();
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
