'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowUp, FileText } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '@/lib/utils'

type ChatComposerProps = {
  disabled?: boolean
  isStreaming?: boolean
  selectedCount: number
  onSend: (message: string) => Promise<void>
}

export function ChatComposer({ disabled = false, isStreaming = false, selectedCount, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || sending || isStreaming) return

    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
    } finally {
      setSending(false)
      // Refocus after sending
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <div
      className={cn(
        'relative w-full flex flex-col transition-all duration-200',
        'bg-secondary/30 rounded-2xl border border-input focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20',
        (disabled || sending || isStreaming) && 'opacity-60 cursor-not-allowed'
      )}
    >
      {selectedCount > 0 && (
        <div className='px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar'>
          <Badge
            variant='secondary'
            className='gap-1.5 px-2 py-0.5 h-7 rounded-lg font-medium text-xs whitespace-nowrap bg-secondary/80 hover:bg-secondary border-none'
          >
            <FileText className='w-3.5 h-3.5 text-muted-foreground' />
            {selectedCount} document{selectedCount === 1 ? '' : 's'} selected
          </Badge>
        </div>
      )}

      <div className='flex items-end gap-2 p-2 pl-4'>
        <TextareaAutosize
          ref={textareaRef}
          rows={1}
          maxRows={5}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Message DeveloperKB...'
          disabled={disabled || sending || isStreaming}
          className='flex-1 min-w-0 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2.5 text-[15px] leading-relaxed placeholder:text-muted-foreground/60'
        />

        <Button
          size='icon'
          onClick={() => void handleSend()}
          disabled={!value.trim() || disabled || sending || isStreaming}
          className={cn(
            'h-8 w-8 rounded-full shrink-0 transition-all duration-200 mb-1 mr-1',
            value.trim()
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted-foreground/20 text-background'
          )}
        >
          {sending || isStreaming ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ArrowUp className='h-5 w-5 stroke-[2.5px]' />
          )}
        </Button>
      </div>
    </div>
  )
}
