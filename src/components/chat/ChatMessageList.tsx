'use client'

import { Message } from '@/types/graphql'
import { ChatMessageBubble } from './ChatMessageBubble'
import { Skeleton } from '@/components/ui/skeleton'
import { History } from 'lucide-react'

type ChatMessageListProps = {
  messages: Message[]
  isLoading: boolean
  streamedMessage?: Message | null
  streamedContent?: string
}

export function ChatMessageList({ messages, isLoading, streamedMessage, streamedContent }: ChatMessageListProps) {
  const allMessages = streamedMessage ? [...messages, streamedMessage] : messages

  if (isLoading && messages.length === 0) {
    return (
      <div className='py-6 space-y-4 px-4 md:px-6'>
        {/* Simulate: user → assistant → user → assistant */}
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-52 rounded-3xl' />
        </div>
        <div className='max-w-3xl space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-4/6' />
        </div>
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-40 rounded-3xl' />
        </div>
        <div className='max-w-3xl space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      </div>
    )
  }

  if (allMessages.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center p-8 space-y-4'>
        <div className='size-16 rounded-2xl bg-muted/50 flex items-center justify-center'>
          <History className='size-8 text-muted-foreground opacity-50' />
        </div>
        <div className='max-w-sm space-y-2'>
          <h3 className='text-xl font-semibold tracking-tight'>Start a conversation</h3>
          <p className='text-muted-foreground'>
            Ask a question to generate an answer grounded in your selected documents.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full pb-4 max-w-3xl mx-auto'>
      {allMessages.map(message => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          streamedContent={message.id === streamedMessage?.id ? streamedContent : undefined}
        />
      ))}
    </div>
  )
}
