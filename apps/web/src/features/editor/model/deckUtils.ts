import { arrayMove } from '@dnd-kit/sortable'

import type { Slide } from './types'

export function reorderSlides(slides: Slide[], activeId: string, overId: string): Slide[] {
  const oldIndex = slides.findIndex((s) => s.id === activeId)
  const newIndex = slides.findIndex((s) => s.id === overId)

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return slides
  }

  return arrayMove(slides, oldIndex, newIndex)
}
