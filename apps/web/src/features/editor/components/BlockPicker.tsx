import type { BlockType } from '../model/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type BlockPickerProps = {
  open: boolean
  onClose: () => void
  onPick: (type: BlockType) => void
}

const options: Array<{ type: BlockType; title: string; description: string }> = [
  { type: 'heading', title: 'Heading', description: 'Big editorial title' },
  { type: 'stat', title: 'Stat', description: 'Label + value' },
  { type: 'chart', title: 'Chart', description: 'Placeholder chart block' },
  { type: 'text', title: 'Text', description: 'Body text' },
  { type: 'comparison', title: 'Comparison', description: 'Two columns' },
  { type: 'media', title: 'Media', description: 'Image/video placeholder' },
]

export function BlockPicker(props: BlockPickerProps) {
  return (
    <Sheet
      open={props.open}
      onOpenChange={(next) => {
        if (!next) props.onClose()
      }}
    >
      <SheetContent side="right" className="w-[420px] sm:w-[520px]">
        <SheetHeader>
          <SheetTitle>Add block</SheetTitle>
          <SheetDescription>Pick a block type to add to the slide.</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3">
          {options.map((o) => (
            <Button
              key={o.type}
              variant="outline"
              className="h-auto items-start justify-start whitespace-normal rounded-lg p-3 text-left"
              onClick={() => props.onPick(o.type)}
            >
              <div className="flex flex-col">
                <div className="text-sm font-semibold">{o.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{o.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
