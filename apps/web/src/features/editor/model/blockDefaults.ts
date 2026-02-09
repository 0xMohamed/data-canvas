import type { BlockContent, BlockType } from './types'

export function makeDefaultContent(type: BlockType): BlockContent {
  switch (type) {
    case 'heading':
      return { type: 'heading', text: 'A headline that tells the story' }
    case 'text':
      return { type: 'text', text: 'Write something insightful here…' }
    case 'stat':
      return { type: 'stat', label: 'Conversion', value: '24%' }
    case 'chart':
      return { type: 'chart', title: 'Revenue by month' }
    case 'comparison':
      return { type: 'comparison', leftLabel: 'Before', rightLabel: 'After' }
    case 'media':
      return { type: 'media', caption: 'A visual that supports the narrative' }
  }
}
