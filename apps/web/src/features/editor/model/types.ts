export type BlockType =
  | 'heading'
  | 'text'
  | 'stat'
  | 'chart'
  | 'comparison'
  | 'media'

export type BlockId = string

export type GridPosition = {
  colStart: number // 1..12
  colSpan: number // integer columns
  rowStart: number // 1..N
  rowSpan: number // integer rows
}

export type BlockContent =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'stat'; label: string; value: string }
  | { type: 'chart'; title: string }
  | { type: 'comparison'; leftLabel: string; rightLabel: string }
  | { type: 'media'; url?: string; caption?: string }

export type BlockBase = {
  id: BlockId
  position: GridPosition
  content: BlockContent
}

export type Slide = {
  id: string
  title: string
  themeId: string
  blocks: BlockBase[]
}

export type Deck = {
  title?: string
  slides: Slide[]
  activeSlideId: string
}
