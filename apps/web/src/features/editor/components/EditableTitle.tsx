import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export function EditableTitle({
  title,
  onChange,
  className,
}: {
  title: string
  onChange: (newTitle: string) => void
  className?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(title)
  }, [title])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function handleBlur() {
    setIsEditing(false)
    if (value.trim() !== title) {
      onChange(value.trim() || title)
    } else {
      setValue(title)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setValue(title)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-7 min-w-[200px] rounded-sm border border-input bg-transparent px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring',
          className,
        )}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'h-7 rounded-sm px-2 py-1 text-left text-sm font-medium hover:bg-muted/50',
        className,
      )}
    >
      {title}
    </button>
  )
}
