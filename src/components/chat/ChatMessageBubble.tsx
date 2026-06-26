'use client'

import { Message } from '@/types/graphql'
import { ChatMarkdown } from './ChatMarkdown'
import { TypingIndicator } from './TypingIndicator'
import { cn } from '@/lib/utils'

type ChatMessageBubbleProps = {
  message: Message
  streamedContent?: string
}

export function ChatMessageBubble({ message, streamedContent }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.id === 'streaming'

  const content = isStreaming ? (streamedContent ?? '') : message.content

  // User message: right-aligned bubble
  if (isUser) {
    return (
      <div className='w-full flex justify-end px-4 md:px-6 py-3'>
        <div
          className={cn(
            'max-w-[75%] rounded-3xl px-5 py-3',
            'bg-primary text-primary-foreground',
            'text-[15px] leading-relaxed whitespace-pre-wrap break-words'
          )}
        >
          {content}
        </div>
      </div>
    )
  }

  // Assistant / system message: full-width, no bubble
  return (
    <div className='w-full py-3 px-4 md:px-6'>
      <div className='max-w-3xl'>
        <div className={cn('prose prose-sm dark:prose-invert max-w-none break-words', 'text-foreground')}>
          <ChatMarkdown content={content} />
          {isStreaming && <TypingIndicator />}
        </div>
      </div>
    </div>
  )
}
