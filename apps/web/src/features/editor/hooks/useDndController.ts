import { useEffect, useRef, useState } from 'react'
import type { DragEndEvent, DragMoveEvent, DragStartEvent, Modifier } from '@dnd-kit/core'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

import type { BlockBase, BlockId, Slide } from '../model/types'
import { clampColStart } from '../model/constraints'
import { findNearestValidPlacement, moveBlockByDelta, normalizeLayout, snapDeltaToGridSteps } from '../model/layout'

export function useDndController(params: {
  mode: 'edit' | 'public'
  blocks: BlockBase[]
  updateActiveSlide: (updater: (s: Slide) => Slide) => void
  setMessage: (next: string | null) => void
}) {
  const blocksRef = useRef<BlockBase[]>(params.blocks)
  useEffect(() => {
    blocksRef.current = params.blocks
  }, [params.blocks])

  const dragMetricsRef = useRef<{ rowStepPx: number; colWidthPx: number; maxRows: number } | null>(null)
  const [overlayRect, setOverlayRect] = useState<{ width: number; height: number } | null>(null)

  const dragSessionRef = useRef<{
    activeId: BlockId
    startBlocks: BlockBase[]
    startColStart: number
    startRowStart: number
    colSpan: number
    rowSpan: number
  } | null>(null)

  const [dragPreview, setDragPreview] = useState<{
    blockId: BlockId
    colStart: number
    rowStart: number
    colSpan: number
    rowSpan: number
  } | null>(null)

  const [activeDragId, setActiveDragId] = useState<BlockId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const overlayModifiers: Modifier[] = [
    ({ transform }) => {
      const metrics = dragMetricsRef.current
      const session = dragSessionRef.current
      if (!metrics || !session) return transform

      const colSteps = Math.round(transform.x / metrics.colWidthPx)
      const rowSteps = Math.round(transform.y / metrics.rowStepPx)
      let y = rowSteps * metrics.rowStepPx

      const minRowStart = 1
      const maxRowStart = Math.max(1, metrics.maxRows - session.rowSpan + 1)
      const minDeltaRows = minRowStart - session.startRowStart
      const maxDeltaRows = maxRowStart - session.startRowStart
      const minDeltaPx = minDeltaRows * metrics.rowStepPx
      const maxDeltaPx = maxDeltaRows * metrics.rowStepPx
      y = Math.max(minDeltaPx, Math.min(y, maxDeltaPx))

      return { ...transform, x: colSteps * metrics.colWidthPx, y }
    },
  ]

  function getDragMetricsForBlocks(): { rowStepPx: number; maxRows: number } | null {
    const m = dragMetricsRef.current
    if (!m) return null
    return { rowStepPx: m.rowStepPx, maxRows: m.maxRows }
  }

  function onDragStart(event: DragStartEvent, metrics: { rowStepPx: number; colWidthPx: number; maxRows: number; overlayRect?: { width: number; height: number } | null }) {
    if (params.mode !== 'edit') return

    dragMetricsRef.current = { rowStepPx: metrics.rowStepPx, colWidthPx: metrics.colWidthPx, maxRows: metrics.maxRows }
    setOverlayRect(metrics.overlayRect ?? null)

    const activeId = event.active.id as BlockId
    const block = blocksRef.current.find((b) => b.id === activeId)
    if (!block) return

    dragSessionRef.current = {
      activeId,
      startBlocks: blocksRef.current,
      startColStart: block.position.colStart,
      startRowStart: block.position.rowStart,
      colSpan: block.position.colSpan,
      rowSpan: block.position.rowSpan,
    }

    setDragPreview({
      blockId: activeId,
      colStart: block.position.colStart,
      rowStart: block.position.rowStart,
      colSpan: block.position.colSpan,
      rowSpan: block.position.rowSpan,
    })

    setActiveDragId(activeId)
  }

  function onDragMove(event: DragMoveEvent) {
    if (params.mode !== 'edit') return

    const activeId = event.active.id as BlockId
    const session = dragSessionRef.current
    if (!session || session.activeId !== activeId) return

    const metrics = dragMetricsRef.current
    if (!metrics) return

    const { colDelta, rowDelta } = snapDeltaToGridSteps({
      deltaX: event.delta.x,
      deltaY: event.delta.y,
      colWidthPx: metrics.colWidthPx,
      rowStepPx: metrics.rowStepPx,
    })

    const rawColStart = session.startColStart + colDelta
    const nextColStart = clampColStart(rawColStart, session.colSpan)

    const maxRowStart = Math.max(1, metrics.maxRows - session.rowSpan + 1)
    const rawRowStart = session.startRowStart + rowDelta
    const nextRowStart = Math.max(1, Math.min(rawRowStart, maxRowStart))

    const valid = findNearestValidPlacement({
      blocks: blocksRef.current,
      activeId,
      proposed: { colStart: nextColStart, rowStart: nextRowStart },
      size: { colSpan: session.colSpan, rowSpan: session.rowSpan },
      constraints: { maxRows: metrics.maxRows },
    })

    if (!valid) {
      setDragPreview(null)
      return
    }

    setDragPreview({
      blockId: activeId,
      colStart: valid.colStart,
      rowStart: valid.rowStart,
      colSpan: session.colSpan,
      rowSpan: session.rowSpan,
    })
  }

  function onDragEnd(event: DragEndEvent, metrics: { rowStepPx: number; colWidthPx: number; maxRows: number }) {
    if (params.mode !== 'edit') return

    const activeId = event.active.id as string
    const session = dragSessionRef.current
    if (!session || session.activeId !== activeId) return

    const { colDelta, rowDelta } = snapDeltaToGridSteps({
      deltaX: event.delta.x,
      deltaY: event.delta.y,
      colWidthPx: metrics.colWidthPx,
      rowStepPx: metrics.rowStepPx,
    })

    const preview = dragPreview
    const candidate = preview && preview.blockId === activeId ? preview : null

    if (!candidate) {
      const fallback = dragSessionRef.current?.startBlocks
      if (fallback) params.updateActiveSlide((s) => ({ ...s, blocks: fallback }))
      params.setMessage('No space on this slide')
      setTimeout(() => params.setMessage(null), 1800)
      dragMetricsRef.current = null
      dragSessionRef.current = null
      setDragPreview(null)
      setActiveDragId(null)
      setOverlayRect(null)
      return
    }

    const nextBlocks = session.startBlocks.map((b) => {
      if (b.id !== activeId) return b
      if (!candidate) return moveBlockByDelta(b, { colDelta, rowDelta })
      return {
        ...b,
        position: {
          ...b.position,
          colStart: candidate.colStart,
          rowStart: candidate.rowStart,
        },
      }
    })

    const normalized = normalizeLayout(nextBlocks, { maxRows: metrics.maxRows })
    if (!normalized.ok) {
      const fallback = dragSessionRef.current?.startBlocks
      if (fallback) params.updateActiveSlide((s) => ({ ...s, blocks: fallback }))
      params.setMessage('Not enough space')
      setTimeout(() => params.setMessage(null), 1800)
    } else {
      params.updateActiveSlide((s) => ({ ...s, blocks: normalized.blocks }))
    }

    dragMetricsRef.current = null
    dragSessionRef.current = null
    setDragPreview(null)
    setActiveDragId(null)
    setOverlayRect(null)
  }

  return {
    sensors,
    dragPreview,
    activeDragId,
    overlayRect,
    overlayModifiers,
    getDragMetricsForBlocks,
    onDragStart,
    onDragMove,
    onDragEnd,
  }
}
