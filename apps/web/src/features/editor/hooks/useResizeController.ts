import { useRef } from 'react'

import type { BlockBase, BlockId, Slide } from '../model/types'
import { constraintsByType, getBlockType, clampColStart, clampRowSpan, clampSpan } from '../model/constraints'
import { normalizeLayout, resolveCollisions } from '../model/layout'

export type ResizeAxis = 'x' | 'y'

type ResizeSession = {
  blockId: BlockId
  axis: ResizeAxis
  startX: number
  startY: number
  stepXPx: number
  stepYPx: number
  maxRows: number
  startColSpan: number
  startRowSpan: number
  startColStart: number
  startRowStart: number
  lastAppliedSteps: number
  neighborRightId?: BlockId
  neighborStart?: {
    colStart: number
    colSpan: number
    rowStart: number
    rowSpan: number
  }
}

export function useResizeController(params: {
  updateActiveSlide: (updater: (s: Slide) => Slide) => void
  setMessage: (next: string | null) => void
}) {
  const resizeSessionRef = useRef<ResizeSession | null>(null)
  const resizeRafRef = useRef<number | null>(null)
  const resizeStartBlocksRef = useRef<BlockBase[] | null>(null)

  function applyResizeSteps(steps: number) {
    const session = resizeSessionRef.current
    if (!session) return
    if (steps === session.lastAppliedSteps) return
    session.lastAppliedSteps = steps

    params.updateActiveSlide((s) => {
      const a = s.blocks.find((b) => b.id === session.blockId)
      if (!a) return s

      const aType = getBlockType(a.content)

      if (session.axis === 'y') {
        const maxAllowedSpan = Math.max(1, session.maxRows - session.startRowStart + 1)
        const nextRowSpan = Math.min(clampRowSpan(aType, session.startRowSpan + steps), maxAllowedSpan)

        const nextBlocks = s.blocks.map((b) =>
          b.id === a.id ? { ...b, position: { ...b.position, rowSpan: nextRowSpan } } : b,
        )
        return { ...s, blocks: resolveCollisions(nextBlocks) }
      }

      const nextColSpan = clampSpan(aType, session.startColSpan + steps)
      const nextColStart = clampColStart(session.startColStart, nextColSpan)

      let blocks = s.blocks.map((b) =>
        b.id === a.id
          ? {
              ...b,
              position: {
                ...b.position,
                colSpan: nextColSpan,
                colStart: nextColStart,
              },
            }
          : b,
      )

      const neighborId = session.neighborRightId
      const neighborStart = session.neighborStart
      if (!neighborId || !neighborStart) {
        return { ...s, blocks: resolveCollisions(blocks) }
      }

      const b = s.blocks.find((x) => x.id === neighborId)
      if (!b) return { ...s, blocks: resolveCollisions(blocks) }

      const bType = getBlockType(b.content)
      const bC = constraintsByType[bType]

      const aEndStart = session.startColStart + session.startColSpan - 1
      const aEndNow = nextColStart + nextColSpan - 1

      // Expand A into B: shrink B from its left edge to preserve its right edge.
      if (steps > 0) {
        const overlap = Math.max(0, aEndNow - (neighborStart.colStart - 1))
        if (overlap > 0) {
          const targetSpan = neighborStart.colSpan - overlap
          const clampedSpan = clampSpan(bType, targetSpan)

          // Only keep B in-row if we can absorb the entire overlap without going below min.
          if (clampedSpan >= bC.minColSpan && clampedSpan === targetSpan) {
            const nextBStart = neighborStart.colStart + overlap
            blocks = blocks.map((blk) =>
              blk.id === b.id
                ? {
                    ...blk,
                    position: {
                      ...blk.position,
                      colStart: nextBStart,
                      colSpan: clampedSpan,
                    },
                  }
                : blk,
            )
          }
        }
      }

      // Shrink A: allow B to grow left into the freed space, preserving its right edge.
      if (steps < 0) {
        const freed = aEndStart - aEndNow
        if (freed > 0) {
          const desiredGrow = freed
          const maxGrow = constraintsByType[bType].maxColSpan - neighborStart.colSpan
          const appliedGrow = Math.max(0, Math.min(desiredGrow, maxGrow))
          if (appliedGrow > 0) {
            const nextBStart = Math.max(1, neighborStart.colStart - appliedGrow)
            const nextBSpan = neighborStart.colSpan + appliedGrow

            blocks = blocks.map((blk) =>
              blk.id === b.id
                ? {
                    ...blk,
                    position: {
                      ...blk.position,
                      colStart: nextBStart,
                      colSpan: nextBSpan,
                    },
                  }
                : blk,
            )
          }
        }
      }

      return { ...s, blocks: resolveCollisions(blocks) }
    })
  }

  function startResize(args: {
    blocks: BlockBase[]
    blockId: BlockId
    axis: ResizeAxis
    clientX: number
    clientY: number
    stepXPx: number
    stepYPx: number
    maxRows: number
  }) {
    const block = args.blocks.find((b) => b.id === args.blockId)
    if (!block) return

    resizeStartBlocksRef.current = args.blocks

    let neighborRightId: BlockId | undefined
    let neighborStart:
      | {
          colStart: number
          colSpan: number
          rowStart: number
          rowSpan: number
        }
      | undefined

    if (args.axis === 'x') {
      const a = block.position
      const aRowEnd = a.rowStart + a.rowSpan - 1
      const aColEnd = a.colStart + a.colSpan - 1

      const candidates = args.blocks
        .filter((b) => b.id !== block.id)
        .filter((b) => {
          const p = b.position
          const rowEnd = p.rowStart + p.rowSpan - 1
          const rowsOverlap = p.rowStart <= aRowEnd && rowEnd >= a.rowStart
          return rowsOverlap && p.colStart === aColEnd + 1
        })
        .sort((l, r) => l.position.colStart - r.position.colStart)

      const neighbor = candidates[0]
      if (neighbor) {
        neighborRightId = neighbor.id
        neighborStart = { ...neighbor.position }
      }
    }

    resizeSessionRef.current = {
      blockId: args.blockId,
      axis: args.axis,
      startX: args.clientX,
      startY: args.clientY,
      stepXPx: args.stepXPx,
      stepYPx: args.stepYPx,
      maxRows: args.maxRows,
      startColSpan: block.position.colSpan,
      startRowSpan: block.position.rowSpan,
      startColStart: block.position.colStart,
      startRowStart: block.position.rowStart,
      lastAppliedSteps: 0,
      neighborRightId,
      neighborStart,
    }
  }

  function onResizeMove(args: { axis: ResizeAxis; clientX: number; clientY: number }) {
    const session = resizeSessionRef.current
    if (!session) return
    if (session.axis !== args.axis) return

    const deltaPx = args.axis === 'x' ? args.clientX - session.startX : args.clientY - session.startY
    const stepPx = args.axis === 'x' ? session.stepXPx : session.stepYPx
    const raw = deltaPx / stepPx

    // Truncation (toward 0) avoids early stepping. Step only when crossing full boundaries.
    const steps = Math.trunc(raw)

    if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current)
    resizeRafRef.current = requestAnimationFrame(() => {
      applyResizeSteps(steps)
    })
  }

  function endResize(args: { maxRows: number }) {
    resizeSessionRef.current = null
    if (resizeRafRef.current) {
      cancelAnimationFrame(resizeRafRef.current)
      resizeRafRef.current = null
    }

    params.updateActiveSlide((s) => {
      const normalized = normalizeLayout(s.blocks, { maxRows: args.maxRows })
      if (!normalized.ok) {
        const fallback = resizeStartBlocksRef.current
        if (fallback) return { ...s, blocks: fallback }
        params.setMessage('Not enough space')
        setTimeout(() => params.setMessage(null), 1800)
        return s
      }
      return { ...s, blocks: normalized.blocks }
    })

    resizeStartBlocksRef.current = null
  }

  return {
    startResize,
    onResizeMove,
    endResize,
  }
}
