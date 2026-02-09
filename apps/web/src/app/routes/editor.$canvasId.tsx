import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import type { components } from '@/api/schema'
import { useMe } from '@/features/auth/hooks'
import { useCanvas } from '@/features/canvases/hooks'
import type { BlockContent, Deck, Slide } from '@/features/editor/model/types'
import { SlideEditor } from '@/features/editor'

export const Route = createFileRoute('/editor/$canvasId')({
  component: EditorCanvasRoute,
})

function EditorCanvasRoute() {
  const navigate = useNavigate()
  const me = useMe()

  const { canvasId } = Route.useParams()
  const canvas = useCanvas(canvasId)

  type ApiBlock = components['schemas']['Block']
  type GetCanvasWithBlocksResponse = components['schemas']['GetCanvasWithBlocksResponse']

  function coerceBlockContent(content: unknown): BlockContent {
    if (!content || typeof content !== 'object') return { type: 'text', text: '' }
    const c = content as { type?: unknown }
    if (typeof c.type !== 'string') return { type: 'text', text: '' }
    const t = c.type
    if (t === 'heading' || t === 'text' || t === 'stat' || t === 'chart' || t === 'comparison' || t === 'media') {
      return content as BlockContent
    }
    return { type: 'text', text: '' }
  }

  const deck = useMemo<Deck>(() => {
    const data = canvas.data as GetCanvasWithBlocksResponse | undefined
    const blocks: ApiBlock[] = data?.data?.blocks ?? []

    const slide: Slide = {
      id: 'slide_1',
      title: 'Slide 1',
      themeId: 'dark-editorial',
      blocks: blocks.map((b) => ({
        id: b.id,
        content: coerceBlockContent(b.content),
        position: {
          colStart: Math.max(1, Math.min(12, Math.round((b.x ?? 0) / 80) + 1)),
          colSpan: Math.max(1, Math.min(12, Math.round((b.w ?? 320) / 80))),
          rowStart: Math.max(1, Math.round((b.y ?? 0) / 60) + 1),
          rowSpan: Math.max(1, Math.round((b.h ?? 120) / 60)),
        },
      })),
    }

    return { slides: [slide], activeSlideId: slide.id }
  }, [canvas.data])

  if (me.isLoading) return <div className="p-6">Loading…</div>
  if (me.isError) {
    navigate({ to: '/login' })
    return null
  }

  if (canvas.isLoading) return <div className="p-6">Loading canvas…</div>
  if (canvas.isError) return <div className="p-6">Failed to load canvas</div>

  return <SlideEditor initialDeck={deck} />
}
