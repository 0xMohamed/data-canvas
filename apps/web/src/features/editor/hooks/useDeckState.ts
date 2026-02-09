import { useCallback, useMemo, useState } from 'react'

import type { BlockBase, BlockId, BlockType, Deck, Slide } from '../model/types'
import { constraintsByType } from '../model/constraints'
import { resolveCollisions } from '../model/layout'
import { makeDefaultContent } from '../model/blockDefaults'
import { reorderSlides } from '../model/deckUtils'

export function useDeckState(params: { initialDeck: Deck }) {
  const [deck, setDeck] = useState<Deck>(() => params.initialDeck)

  const activeSlide = useMemo(() => {
    return deck.slides.find((s) => s.id === deck.activeSlideId) ?? deck.slides[0]
  }, [deck.activeSlideId, deck.slides])

  const setActiveSlideId = useCallback((id: string) => {
    setDeck((prev) => ({ ...prev, activeSlideId: id }))
  }, [])

  const updateActiveSlide = useCallback((updater: (s: Slide) => Slide) => {
    setDeck((prev) => {
      const nextSlides = prev.slides.map((s) => (s.id === prev.activeSlideId ? updater(s) : s))
      return { ...prev, slides: nextSlides }
    })
  }, [])

  const addSlide = useCallback((params?: { themeId?: string }) => {
    setDeck((prev) => {
      const active = prev.slides.find((s) => s.id === prev.activeSlideId) ?? prev.slides[0]
      const themeId = params?.themeId ?? active?.themeId

      const nextIndex = prev.slides.length + 1
      const id = `slide_${Math.random().toString(16).slice(2)}`
      const next: Slide = {
        id,
        title: `Slide ${nextIndex}`,
        themeId: themeId ?? 'dark-editorial',
        blocks: [],
      }

      return { ...prev, slides: [...prev.slides, next], activeSlideId: id }
    })
  }, [])

  const addBlock = useCallback((type: BlockType) => {
    const id = `b_${Math.random().toString(16).slice(2)}`
    const content = makeDefaultContent(type)
    const c = constraintsByType[type]

    setDeck((prev) => {
      const active = prev.slides.find((s) => s.id === prev.activeSlideId) ?? prev.slides[0]
      const maxRow = (active?.blocks ?? []).reduce((m, b) => Math.max(m, b.position.rowStart + b.position.rowSpan - 1), 1)

      const next: BlockBase = {
        id,
        content,
        position: {
          colStart: 1,
          colSpan: c.minColSpan,
          rowStart: maxRow + 1,
          rowSpan: c.minRowSpan,
        },
      }

      const nextSlides = prev.slides.map((s) => {
        if (s.id !== prev.activeSlideId) return s
        return { ...s, blocks: resolveCollisions([...(s.blocks ?? []), next]) }
      })

      return { ...prev, slides: nextSlides }
    })
  }, [])

  const updateBlock = useCallback(
    (id: BlockId, updater: (b: BlockBase) => BlockBase) => {
      updateActiveSlide((s) => {
        const nextBlocks = s.blocks.map((b) => (b.id === id ? updater(b) : b))
        return { ...s, blocks: resolveCollisions(nextBlocks) }
      })
    },
    [updateActiveSlide],
  )

  const prevSlide = useCallback(() => {
    setDeck((prev) => {
      const idx = prev.slides.findIndex((s) => s.id === prev.activeSlideId)
      const next = Math.max(0, idx - 1)
      return { ...prev, activeSlideId: prev.slides[next]?.id ?? prev.activeSlideId }
    })
  }, [])

  const nextSlide = useCallback(() => {
    setDeck((prev) => {
      const idx = prev.slides.findIndex((s) => s.id === prev.activeSlideId)
      const next = Math.min(prev.slides.length - 1, Math.max(0, idx + 1))
      return { ...prev, activeSlideId: prev.slides[next]?.id ?? prev.activeSlideId }
    })
  }, [])

  const reorderSlidesAction = useCallback((activeId: string, overId: string) => {
    setDeck((prev) => {
      const nextSlides = reorderSlides(prev.slides, activeId, overId)
      return { ...prev, slides: nextSlides }
    })
  }, [])

  const setDeckTitle = useCallback((title: string) => {
    setDeck((prev) => ({ ...prev, title }))
  }, [])

  const actions = useMemo(
    () => ({
      setActiveSlideId,
      updateActiveSlide,
      addSlide,
      addBlock,
      updateBlock,
      prevSlide,
      nextSlide,
      reorderSlides: reorderSlidesAction,
      setDeckTitle,
    }),
    [
      addBlock,
      addSlide,
      nextSlide,
      prevSlide,
      reorderSlidesAction,
      setActiveSlideId,
      setDeckTitle,
      updateActiveSlide,
      updateBlock,
    ],
  )

  return {
    deck,
    activeSlide,
    actions,
  }
}
