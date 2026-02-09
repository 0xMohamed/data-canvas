import { Check, Palette } from 'lucide-react'

import type { SlideTheme } from './themes'
import { slideThemes } from './themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ThemeSwitcherProps = {
  value: SlideTheme['id']
  onChange: (id: SlideTheme['id']) => void
}

export function ThemeSwitcher(props: ThemeSwitcherProps) {
  const current = slideThemes.find((t) => t.id === props.value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette />
          {current?.name ?? 'Theme'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {slideThemes.map((t) => (
          <DropdownMenuItem key={t.id} onSelect={() => props.onChange(t.id)}>
            <span className="mr-2 inline-flex w-4 items-center justify-center">
              {t.id === props.value ? <Check className="h-4 w-4" /> : null}
            </span>
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
