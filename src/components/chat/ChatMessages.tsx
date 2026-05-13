'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useChat } from '@/contexts/chat-context'
import { GET_CHAT, GET_MESSAGES } from '@/graphql/queries'
import { CREATE_CHAT, CREATE_MESSAGE, DELETE_CHAT } from '@/graphql/mutations'
import { Chat, Message } from '@/types/graphql'
import { useChatStreaming } from '@/hooks/useChatStreaming'
import { processSourceReferences } from '@/utils/processSourceReferences'
import { toErrorMessage } from '@/utils/error-utils'

import { ChatMessageList } from './ChatMessageList'
import { ChatComposer } from './ChatComposer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type ChatMessagesProps = {
  activeChatId: string | null
  isDraftChat: boolean
  historyOpen?: boolean
  onToggleHistory?: () => void
}

export function ChatMessages({ activeChatId, isDraftChat, historyOpen, onToggleHistory }: ChatMessagesProps) {
  const { selectedDocumentIds } = useChat()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createChat] = useMutation<{ createChat: { chat: Chat | null } }>(CREATE_CHAT)
  const [createMessage] = useMutation(CREATE_MESSAGE)
  const [deleteChat] = useMutation(DELETE_CHAT)
  const { isStreaming, streamedContent, streamResponse } = useChatStreaming()

  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
    refetch: refetchChat
  } = useQuery<{ chat: Chat }>(GET_CHAT, {
    variables: { id: activeChatId },
    skip: !activeChatId
  })

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery<{
    messages: {
      messages: Message[]
      total: number
      page: number
      limit: number
      totalPages: number
      hasMore: boolean
    }
  }>(GET_MESSAGES, {
    variables: { chatId: activeChatId, page: 1, limit: 50 },
    skip: !activeChatId,
    fetchPolicy: 'cache-and-network'
  })

  const chatTitle = useMemo(() => {
    if (!activeChatId) return 'New Chat'
    return chatData?.chat?.title || 'Untitled Chat'
  }, [activeChatId, chatData?.chat?.title])

  const messages = messagesData?.messages?.messages ?? []
  const streamPreview = streamedMessage
    ? {
        ...streamedMessage,
        content: processSourceReferences(streamedContent)
      }
    : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, streamedContent])

  const loadErrorMessage = chatError?.message ?? messagesError?.message ?? null
  const displayErrorMessage = errorMessage ?? loadErrorMessage

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    setErrorMessage(null)
    let chatIdToUse = activeChatId
    let createdChatId: string | null = null

    try {
      if (!chatIdToUse) {
        const title = message.trim().slice(0, 60) || 'New Chat'
        const result = await createChat({
          variables: { input: { title } }
        })

        createdChatId = result.data?.createChat?.chat?.id ?? null
        chatIdToUse = createdChatId

        if (!chatIdToUse) {
          throw new Error('Failed to create chat')
        }
      }

      await createMessage({
        variables: {
          input: {
            chat_id: chatIdToUse,
            role: 'user',
            content: message,
            metadata: { selectedDocuments: selectedDocumentIds }
          }
        }
      })

      const tempMessage: Message = {
        id: 'streaming',
        chat_id: chatIdToUse,
        role: 'assistant',
        content: '',
        metadata: null,
        created_at: new Date().toISOString()
      }

      setStreamedMessage(tempMessage)
      const assistantContent = await streamResponse(message, selectedDocumentIds)

      await createMessage({
        variables: {
          input: {
            chat_id: chatIdToUse,
            role: 'assistant',
            content: assistantContent
          }
        }
      })

      setStreamedMessage(null)

      if (activeChatId) {
        await refetchMessages()
        await refetchChat()
      }

      if (!activeChatId && chatIdToUse) {
        router.replace(`/chat/${chatIdToUse}`)
      }
    } catch (sendError) {
      setStreamedMessage(null)
      const messageText = toErrorMessage(sendError)
      setErrorMessage(messageText)

      if (createdChatId) {
        try {
          await deleteChat({ variables: { id: createdChatId } })
        } catch (deleteError) {
          console.error('Failed to rollback temporary chat:', deleteError)
        }
      }
    }
  }

  const selectedCount = selectedDocumentIds.length

  return (
    <div className='flex flex-col h-full w-full overflow-hidden'>
      {/* Header */}
      <header className='flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4'>
        <Button
          variant='ghost'
          size='icon'
          className='-ml-1 shrink-0'
          onClick={onToggleHistory}
          title={historyOpen ? 'Close history' : 'Open history'}
        >
          {historyOpen ? <PanelLeftClose className='size-5' /> : <PanelLeftOpen className='size-5' />}
        </Button>
        <div className='flex flex-1 items-center gap-2 overflow-hidden'>
          <h1 className='text-sm font-semibold truncate'>{chatTitle}</h1>
          <span className='text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0'>
            {activeChatId ? 'Conversation' : 'Draft'}
          </span>
        </div>
      </header>

      {/* Scrollable message area */}
      <ScrollArea className='flex-1 overflow-hidden'>
        <div className='flex flex-col'>
          {displayErrorMessage && (
            <div className='mx-4 mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3'>
              <AlertCircle className='size-5 shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>{displayErrorMessage}</p>
                {activeChatId && (
                  <Button
                    variant='link'
                    size='sm'
                    className='text-destructive p-0 h-auto mt-1'
                    onClick={() => refetchMessages()}
                  >
                    <RefreshCw className='size-3 mr-1' />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}

          {chatLoading && activeChatId ? (
            <div className='space-y-6 py-8'>
              {[1, 2, 3].map(i => (
                <div key={i} className='max-w-3xl mx-auto flex gap-6 px-6'>
                  <Skeleton className='size-8 rounded-full shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-20 w-full' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              isLoading={messagesLoading}
              streamedMessage={streamPreview}
              streamedContent={streamedContent}
            />
          )}
          <div ref={messagesEndRef} className='h-1' />
        </div>
      </ScrollArea>

      {/* Composer — pinned at bottom, outside scroll area */}
      <div className='shrink-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3'>
        <div className='max-w-3xl mx-auto flex flex-col gap-2'>
          <ChatComposer
            disabled={false}
            isStreaming={isStreaming}
            selectedCount={selectedCount}
            onSend={handleSendMessage}
          />
          <p className='text-[10px] text-center text-muted-foreground'>
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
