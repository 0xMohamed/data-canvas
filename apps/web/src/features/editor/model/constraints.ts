import type { BlockContent, BlockType } from './types'

export type BlockConstraints = {
  minColSpan: number
  maxColSpan: number
  minRowSpan: number
  maxRowSpan: number
}

export const GRID_COLS = 12

export const constraintsByType: Record<BlockType, BlockConstraints> = {
  heading: { minColSpan: 4, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 4 },
  text: { minColSpan: 4, maxColSpan: 12, minRowSpan: 3, maxRowSpan: 10 },
  stat: { minColSpan: 3, maxColSpan: 6, minRowSpan: 3, maxRowSpan: 5 },
  chart: { minColSpan: 6, maxColSpan: 12, minRowSpan: 6, maxRowSpan: 12 },
  comparison: { minColSpan: 6, maxColSpan: 12, minRowSpan: 5, maxRowSpan: 10 },
  media: { minColSpan: 4, maxColSpan: 12, minRowSpan: 6, maxRowSpan: 14 },
}

export function getBlockType(content: BlockContent): BlockType {
  return content.type
}

export function clampColStart(colStart: number, colSpan: number) {
  const maxStart = Math.max(1, GRID_COLS - colSpan + 1)
  return clampInt(colStart, 1, maxStart)
}

export function clampSpan(type: BlockType, colSpan: number) {
  const c = constraintsByType[type]
  return clampInt(colSpan, c.minColSpan, c.maxColSpan)
}

export function clampRowSpan(type: BlockType, rowSpan: number) {
  const c = constraintsByType[type]
  return clampInt(rowSpan, c.minRowSpan, c.maxRowSpan)
}

function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)))
}
