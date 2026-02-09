import { Plus } from "lucide-react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useState } from "react";

import type { Deck, Slide } from "../model/types";
import { SlideThumbnail } from "./SlideThumbnail";

import { cn } from "@/lib/utils";

export function SlidesSidebar(props: {
  deck: Deck;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onReorderSlides: (activeId: string, overId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    props.onReorderSlides(active.id as string, over.id as string);
  }

  const activeSlide = props.deck.slides.find((s) => s.id === activeId);

  return (
    <div className="flex items-center w-[185px] shrink-0 pl-2 pr-4 ">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={props.deck.slides.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex w-full flex-col gap-3 p-3">
            {props.deck.slides.map((s: Slide, index: number) => (
              <SortableSlideItem
                key={s.id}
                slide={s}
                isActive={s.id === props.deck.activeSlideId}
                onSelect={() => props.onSelectSlide(s.id)}
                index={index + 1}
              />
            ))}
            <div className="flex justify-center items-center border border-[color:var(--slide-surface)] bg-[var(--slide-surface)] text-[color:var(--slide-muted)] ml-5 rounded-xl h-[65px]">
              <Plus size={"2rem"} />
            </div>
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null} adjustScale={false}>
          {activeSlide ? (
            <div className="rounded-xl border-[color:var(--slide-accent)] bg-[color:var(--slide-surface)] p-2 shadow-lg">
              <div className="overflow-hidden rounded-lg  border-[color:var(--slide-gridLine)] bg-[color:var(--slide-bg)]">
                <SlideThumbnail slide={activeSlide} />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableSlideItem({
  slide,
  isActive,
  onSelect,
  index,
}: {
  slide: Slide;
  isActive: boolean;
  onSelect: () => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="flex items-center gap-3 cursor-grab active:cursor-grabbing hover:text-foreground transition select-none"
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
      title={slide.title}
    >
      <span className="mt-1 ">{index}</span>
      <div
        className={cn(
          "rounded-lg overflow-hidden border-2 text-left",
          isActive
            ? "border-[color:var(--slide-accent)] bg-[color:var(--slide-surface)]"
            : "border-[color:var(--slide-gridLine)] bg-[color:var(--editor-bg)]/40 "
        )}
      >
        <div className="flex items-start gap-2 w-full">
          <button
            type="button"
            onClick={onSelect}
            className="flex-1 text-left w-full"
            disabled={isDragging}
          >
            <div className="overflow-hidden  border-[color:var(--slide-gridLine)] bg-[color:var(--slide-bg)]">
              <SlideThumbnail slide={slide} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
