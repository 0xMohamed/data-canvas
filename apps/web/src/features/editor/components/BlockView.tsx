import type { BlockBase, BlockContent } from '../model/types'

type BlockViewProps = {
  block: BlockBase
  onContentChange: (next: BlockContent) => void
}

export function BlockView(props: BlockViewProps) {
  const { content } = props.block

  switch (content.type) {
    case 'heading':
      return (
        <EditableText
          value={content.text}
          className="text-3xl font-extrabold leading-tight tracking-tight"
          onChange={(text) => props.onContentChange({ type: 'heading', text })}
        />
      )
    case 'text':
      return (
        <EditableText
          value={content.text}
          className="text-sm leading-relaxed text-[color:var(--slide-text)]/90"
          onChange={(text) => props.onContentChange({ type: 'text', text })}
        />
      )
    case 'stat':
      return (
        <div className="flex flex-col gap-2">
          <EditableText
            value={content.label}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--slide-muted)]"
            onChange={(label) => props.onContentChange({ ...content, label })}
          />
          <div className="text-4xl font-extrabold leading-none">{content.value}</div>
        </div>
      )
    case 'chart':
      return (
        <div>
          <div className="text-sm font-semibold">{content.title}</div>
          <div
            className="mt-3 h-36 rounded-lg border border-dashed border-[color:var(--slide-gridLine)] bg-gradient-to-b from-white/10 to-white/5"
          />
        </div>
      )
    case 'comparison':
      return (
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div className={comparisonPanelClass}>
              <div className="text-xs font-semibold text-[color:var(--slide-text)]/85">{content.leftLabel}</div>
            </div>
            <div className={comparisonPanelClass}>
              <div className="text-xs font-semibold text-[color:var(--slide-text)]/85">{content.rightLabel}</div>
            </div>
          </div>
        </div>
      )
    case 'media':
      return (
        <div>
          <div className="text-xs text-[color:var(--slide-muted)]">{content.caption ?? 'Media'}</div>
          <div
            className="mt-3 h-40 rounded-xl border border-[color:var(--slide-gridLine)] bg-white/5"
          />
        </div>
      )
  }
}

function EditableText(props: {
  value: string
  onChange: (next: string) => void
  className?: string
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className={['outline-none focus:outline-none', props.className].filter(Boolean).join(' ')}
      onBlur={(e) => {
        props.onChange((e.currentTarget.textContent ?? '').trim())
      }}
    >
      {props.value}
    </div>
  )
}

const comparisonPanelClass =
  'h-[120px] rounded-xl border border-[color:var(--slide-gridLine)] bg-white/5 p-3'
