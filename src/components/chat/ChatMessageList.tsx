'use client'

import { Message } from '@/types/graphql'
import { ChatMessageBubble } from './ChatMessageBubble'
import { Skeleton } from '@/components/ui/skeleton'
import { History } from 'lucide-react'
import { useEffect, useRef, useCallback, useMemo } from 'react'

type ChatMessageListProps = {
  messages: Message[]
  isLoading: boolean
  streamedMessage?: Message | null
  streamedContent?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isFetchingMore?: boolean
}

export function ChatMessageList({
  messages,
  isLoading,
  streamedMessage,
  streamedContent,
  onLoadMore,
  hasMore,
  isFetchingMore
}: ChatMessageListProps) {
  const allMessages = useMemo(
    () => (streamedMessage ? [...messages, streamedMessage] : messages),
    [messages, streamedMessage]
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef(0)
  const prevMessageCountRef = useRef(0)
  const isAtBottomRef = useRef(true)
  const isFetchingRef = useRef(false)

  // Tracks if the last message count change was from a load-more (prepend)
  // vs a new sent/received message — so we never confuse the two
  const lastChangeWasPrependRef = useRef(false)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    anchorRef.current?.scrollIntoView({ behavior })
  }, [])

  // Track scroll position + trigger load-more near top
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isAtBottomRef.current = distanceFromBottom < 80

    if (el.scrollTop < 100 && hasMore && !isFetchingRef.current && onLoadMore) {
      isFetchingRef.current = true
      lastChangeWasPrependRef.current = true
      prevScrollHeightRef.current = el.scrollHeight
      onLoadMore()
    }
  }, [hasMore, onLoadMore])

  // Restore scroll position after prepend so viewport doesn't jump
  useEffect(() => {
    if (!isFetchingMore && isFetchingRef.current) {
      isFetchingRef.current = false
      const el = scrollRef.current
      if (!el) return
      const addedHeight = el.scrollHeight - prevScrollHeightRef.current
      el.scrollTop = addedHeight
      prevScrollHeightRef.current = 0
    }
  }, [isFetchingMore, allMessages.length])

  // Scroll on new messages — but only when it's a new send/receive, not a prepend
  useEffect(() => {
    const countIncreased = allMessages.length > prevMessageCountRef.current

    if (countIncreased && !lastChangeWasPrependRef.current) {
      // Always scroll to bottom when a new message is added
      scrollToBottom('smooth')
    }

    // Reset prepend flag after handling
    lastChangeWasPrependRef.current = false
    prevMessageCountRef.current = allMessages.length
  }, [allMessages.length, scrollToBottom])

  // While streaming: follow output only if user is at the bottom
  useEffect(() => {
    if (!streamedContent) return
    if (isAtBottomRef.current) {
      scrollToBottom('smooth')
    }
  }, [streamedContent, scrollToBottom])

  // Jump to bottom instantly on initial load
  useEffect(() => {
    if (!isLoading && allMessages.length > 0) {
      scrollToBottom('instant')
    }
    // eslint-disable-next-line
  }, [isLoading])

  if (isLoading && messages.length === 0) {
    return (
      <div className='py-6 space-y-6 px-4 md:px-6 w-full max-w-3xl mx-auto flex flex-col justify-end min-h-full'>
        {/* User Skeleton */}
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-48 sm:w-64 rounded-3xl rounded-tr-sm' />
        </div>

        {/* Assistant Skeleton */}
        <div className='flex gap-4 max-w-3xl'>
          <div className='size-8 rounded-full shrink-0 flex items-center justify-center bg-muted/60'>
            <Skeleton className='size-5 rounded-full bg-transparent' />
          </div>
          <div className='flex-1 space-y-3 pt-1'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-[90%]' />
            <Skeleton className='h-4 w-[60%]' />
          </div>
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
    <div ref={scrollRef} onScroll={handleScroll} className='flex flex-col flex-1 h-full w-full overflow-y-auto'>
      <div className='flex justify-center py-3'>
        {isFetchingMore && (
          <div className='flex gap-2 items-center text-sm text-muted-foreground'>
            <div className='h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin' />
            Loading older messages...
          </div>
        )}
      </div>

      <div className='flex flex-col pb-4 px-4 md:px-6'>
        {allMessages.map(message => (
          <div key={message.id} className='max-w-3xl mx-auto w-full'>
            <ChatMessageBubble
              message={message}
              streamedContent={message.id === streamedMessage?.id ? streamedContent : undefined}
            />
          </div>
        ))}
      </div>

      {/* Scroll anchor */}
      <div ref={anchorRef} className='h-px shrink-0' />
    </div>
  )
}
