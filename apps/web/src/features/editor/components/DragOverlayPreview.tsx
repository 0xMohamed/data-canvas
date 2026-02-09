import type { BlockBase } from '../model/types'
import { cn } from '@/lib/utils'
import { blockBodyClass, blockHeaderClass, blockShellClass } from './blockClasses'
import { BlockPreviewContent } from './BlockPreviewContent'

export function DragOverlayPreview(props: {
  block: BlockBase | null
  overlayWidthPx: number | null
  overlayHeightPx: number | null
}) {
  if (!props.block) return null

  const style =
    typeof props.overlayWidthPx === 'number' && typeof props.overlayHeightPx === 'number'
      ? { width: props.overlayWidthPx, height: props.overlayHeightPx }
      : undefined

  return (
    <div style={style}>
      <div className={cn(blockShellClass, 'h-full shadow-2xl')}>
        <div className={blockHeaderClass}>
          <div className="text-[10px] font-semibold uppercase tracking-wider">{props.block.content.type}</div>
        </div>
        <div className={cn(blockBodyClass, 'h-full')}>
          <BlockPreviewContent content={props.block.content} />
        </div>
      </div>
    </div>
  )
}
