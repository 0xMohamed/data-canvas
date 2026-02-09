import type { BlockBase, GridPosition } from './types'
import { clampColStart, GRID_COLS } from './constraints'

export const DEFAULT_ROW_HEIGHT_PX = 48
export const DEFAULT_GRID_GAP_PX = 12

export function snapDeltaToGridSteps(params: {
  deltaX: number
  deltaY: number
  colWidthPx: number
  rowStepPx: number
}) {
  const colDelta = Math.round(params.deltaX / params.colWidthPx)
  const rowDelta = Math.round(params.deltaY / params.rowStepPx)

  return { colDelta, rowDelta }
}

export function getColWidthPx(containerWidthPx: number, gapPx = DEFAULT_GRID_GAP_PX) {
  return (containerWidthPx - gapPx * (GRID_COLS - 1)) / GRID_COLS
}

export function moveBlockByDelta(block: BlockBase, delta: { colDelta: number; rowDelta: number }): BlockBase {
  const nextPos: GridPosition = {
    ...block.position,
    colStart: clampColStart(block.position.colStart + delta.colDelta, block.position.colSpan),
    rowStart: Math.max(1, block.position.rowStart + delta.rowDelta),
  }

  return { ...block, position: nextPos }
}

export function rectsOverlap(a: GridPosition, b: GridPosition) {
  const aLeft = a.colStart
  const aRight = a.colStart + a.colSpan - 1
  const aTop = a.rowStart
  const aBottom = a.rowStart + a.rowSpan - 1

  const bLeft = b.colStart
  const bRight = b.colStart + b.colSpan - 1
  const bTop = b.rowStart
  const bBottom = b.rowStart + b.rowSpan - 1

  const colsOverlap = aLeft <= bRight && aRight >= bLeft
  const rowsOverlap = aTop <= bBottom && aBottom >= bTop

  return colsOverlap && rowsOverlap
}

export function resolveCollisions(blocks: BlockBase[]): BlockBase[] {
  const sorted = [...blocks].sort((a, b) => {
    if (a.position.rowStart !== b.position.rowStart) return a.position.rowStart - b.position.rowStart
    return a.position.colStart - b.position.colStart
  })

  const placed: BlockBase[] = []

  for (const block of sorted) {
    const nextStart = { ...block, position: { ...block.position } }
    let next = nextStart

    while (placed.some((p) => rectsOverlap(p.position, next.position))) {
      next = {
        ...next,
        position: {
          ...next.position,
          rowStart: next.position.rowStart + 1,
        },
      }
    }

    placed.push(next)
  }

  const byId = new Map(placed.map((b) => [b.id, b]))
  return blocks.map((b) => byId.get(b.id) ?? b)
}

export type NormalizeLayoutResult =
  | { ok: true; blocks: BlockBase[] }
  | { ok: false; reason: 'cannot_place' }

export function normalizeLayout(blocks: BlockBase[], constraints: { maxRows: number }): NormalizeLayoutResult {
  const sorted = [...blocks].sort((a, b) => {
    if (a.position.rowStart !== b.position.rowStart) return a.position.rowStart - b.position.rowStart
    return a.position.colStart - b.position.colStart
  })

  const placed: BlockBase[] = []

  for (const block of sorted) {
    const maxStart = Math.max(1, constraints.maxRows - block.position.rowSpan + 1)

    let next = {
      ...block,
      position: {
        ...block.position,
        colStart: clampColStart(block.position.colStart, block.position.colSpan),
        rowStart: Math.max(1, Math.min(block.position.rowStart, maxStart)),
      },
    }

    while (placed.some((p) => rectsOverlap(p.position, next.position))) {
      next = {
        ...next,
        position: {
          ...next.position,
          rowStart: next.position.rowStart + 1,
        },
      }

      if (next.position.rowStart > maxStart) {
        return { ok: false, reason: 'cannot_place' }
      }
    }

    placed.push(next)
  }

  const byId = new Map(placed.map((b) => [b.id, b]))
  return { ok: true, blocks: blocks.map((b) => byId.get(b.id) ?? b) }
}

export function findNearestValidPlacement(params: {
  blocks: BlockBase[]
  activeId: string
  proposed: { colStart: number; rowStart: number }
  size: { colSpan: number; rowSpan: number }
  constraints: { maxRows: number }
}): { colStart: number; rowStart: number } | null {
  const { blocks, activeId, proposed, size, constraints } = params
  const others = blocks.filter((b) => b.id !== activeId)

  const maxRowStart = Math.max(1, constraints.maxRows - size.rowSpan + 1)

  function isValid(pos: { colStart: number; rowStart: number }) {
    if (pos.rowStart < 1 || pos.rowStart > maxRowStart) return false

    const colStart = clampColStart(pos.colStart, size.colSpan)
    const rowStart = pos.rowStart
    const candidate: GridPosition = { colStart, colSpan: size.colSpan, rowStart, rowSpan: size.rowSpan }

    return !others.some((b) => rectsOverlap(b.position, candidate))
  }

  const start = {
    colStart: clampColStart(proposed.colStart, size.colSpan),
    rowStart: Math.max(1, Math.min(proposed.rowStart, maxRowStart)),
  }

  if (isValid(start)) return start

  // Deterministic expanding-ring search around the proposed cell.
  // Priority: same row first, nearest columns, then adjacent rows.
  const maxRadius = Math.max(GRID_COLS, constraints.maxRows)
  for (let r = 1; r <= maxRadius; r += 1) {
    // same row, expanding columns
    for (let dx = -r; dx <= r; dx += 1) {
      const p1 = { colStart: start.colStart + dx, rowStart: start.rowStart }
      if (isValid(p1)) return { colStart: clampColStart(p1.colStart, size.colSpan), rowStart: p1.rowStart }
    }

    // rows above/below, scan columns from center outward
    for (const dy of [-r, r]) {
      const row = start.rowStart + dy
      if (row < 1 || row > maxRowStart) continue

      for (let dx = -r; dx <= r; dx += 1) {
        const p = { colStart: start.colStart + dx, rowStart: row }
        if (isValid(p)) return { colStart: clampColStart(p.colStart, size.colSpan), rowStart: p.rowStart }
      }
    }
  }

  return null
}

export function getMaxRowEnd(blocks: BlockBase[]) {
  return blocks.reduce((max, b) => Math.max(max, b.position.rowStart + b.position.rowSpan - 1), 1)
}
