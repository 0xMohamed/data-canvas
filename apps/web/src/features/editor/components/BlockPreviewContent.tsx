import type { BlockContent } from '../model/types'

export function BlockPreviewContent(props: { content: BlockContent }) {
  const c = props.content

  switch (c.type) {
    case 'heading':
      return <div className="text-lg font-extrabold leading-tight tracking-tight">{c.text}</div>
    case 'text':
      return <div className="text-xs leading-relaxed text-[color:var(--slide-text)]/90">{c.text}</div>
    case 'stat':
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--slide-muted)]">{c.label}</div>
          <div className="text-xl font-extrabold leading-none">{c.value}</div>
        </div>
      )
    case 'chart':
      return (
        <div>
          <div className="text-xs font-semibold">{c.title}</div>
          <div className="mt-2 h-10 rounded border border-dashed border-[color:var(--slide-gridLine)] bg-white/5" />
        </div>
      )
    case 'comparison':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-[color:var(--slide-gridLine)] bg-white/5 p-2 text-[10px]">{c.leftLabel}</div>
          <div className="rounded border border-[color:var(--slide-gridLine)] bg-white/5 p-2 text-[10px]">{c.rightLabel}</div>
        </div>
      )
    case 'media':
      return (
        <div>
          <div className="text-[10px] text-[color:var(--slide-muted)]">{c.caption ?? 'Media'}</div>
          <div className="mt-2 h-10 rounded border border-[color:var(--slide-gridLine)] bg-white/5" />
        </div>
      )
  }
}
