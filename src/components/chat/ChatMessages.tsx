'use client'

import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useChat } from '@/contexts/chat-context'
import { GET_CHAT, GET_CHATS, GET_MESSAGES } from '@/graphql/queries'
import { CREATE_CHAT, CREATE_MESSAGE } from '@/graphql/mutations'
import { Chat, Message } from '@/types/graphql'
import { useChatStreaming } from '@/hooks/useChatStreaming'
import { processSourceReferences } from '@/utils/processSourceReferences'
import { toErrorMessage } from '@/utils/error-utils'

import { ChatMessageList } from './ChatMessageList'
import { ChatComposer } from './ChatComposer'
import { NewChatSetup } from './NewChatSetup'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type ChatMessagesProps = {
  activeChatId: string | null
  historyOpen?: boolean
  onToggleHistory?: () => void
}

export function ChatMessages({ activeChatId, historyOpen, onToggleHistory }: ChatMessagesProps) {
  // States
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [creatingChat, setCreatingChat] = useState(false)

  // Contexts
  const { selectedDocumentIds } = useChat()
  const router = useRouter()

  // Apollo Client
  const [createChat] = useMutation<{ createChat: { chat: Chat | null } }>(CREATE_CHAT)
  const [createMessage] = useMutation(CREATE_MESSAGE)

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
    refetch: refetchMessages,
    fetchMore
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
    variables: { chatId: activeChatId, page: 1, limit: 5 },
    skip: !activeChatId,
    fetchPolicy: 'cache-and-network'
  })

  // Custom Hooks
  const { isStreaming, streamedContent, streamResponse } = useChatStreaming()

  // Computed Values
  const messages = useMemo(() => messagesData?.messages?.messages ?? [], [messagesData?.messages?.messages])
  const displayedMessages = useMemo(() => [...messages, ...optimisticMessages], [messages, optimisticMessages])
  const streamPreview = streamedMessage
    ? {
        ...streamedMessage,
        content: processSourceReferences(streamedContent)
      }
    : null

  const handleLoadMore = useCallback(async () => {
    if (!messagesData?.messages?.hasMore || messagesLoading) return
    
    await fetchMore({
      variables: {
        page: messagesData.messages.page + 1
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev

        return {
          messages: {
            ...fetchMoreResult.messages,
            // Prepend older messages fetched to the current ones
            messages: [
              ...fetchMoreResult.messages.messages,
              ...prev.messages.messages
            ]
          }
        }
      }
    })
  }, [fetchMore, messagesData, messagesLoading])

  const chatTitle = useMemo(() => {
    if (!activeChatId) return 'New Chat'
    return chatData?.chat?.title || 'Untitled Chat'
  }, [activeChatId, chatData?.chat?.title])

  const loadErrorMessage = chatError?.message ?? messagesError?.message ?? null
  const displayErrorMessage = errorMessage ?? loadErrorMessage

  const handleCreateChat = async (title: string) => {
    setCreatingChat(true)
    setErrorMessage(null)
    try {
      const result = await createChat({
        variables: { input: { title } },
        refetchQueries: [{ query: GET_CHATS }]
      })

      const chatId = result.data?.createChat?.chat?.id
      if (chatId) {
        router.push(`/chat/${chatId}`)
      } else {
        throw new Error('Failed to create chat')
      }
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setCreatingChat(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return
    if (!activeChatId) {
      setErrorMessage('Please create a chat first.')
      return
    }

    setErrorMessage(null)
    const chatIdToUse = activeChatId

    const optimisticUserId = `local-${Date.now()}`
    const optimisticUserMessage: Message = {
      id: optimisticUserId,
      chat_id: chatIdToUse,
      role: 'user',
      content: message,
      metadata: { selectedDocuments: selectedDocumentIds } as Record<string, unknown>,
      created_at: new Date().toISOString()
    }

    // Show user's message immediately (optimistic UI)
    setOptimisticMessages(prev => [...prev, optimisticUserMessage])

    // Persist user message in background; remove optimistic on error
    createMessage({
      variables: {
        input: {
          chat_id: chatIdToUse,
          role: 'user',
          content: message,
          metadata: { selectedDocuments: selectedDocumentIds }
        }
      }
    }).catch(err => {
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticUserId))
      setErrorMessage(toErrorMessage(err))
    })

    try {
      const tempMessage: Message = {
        id: 'streaming',
        chat_id: chatIdToUse,
        role: 'assistant',
        content: '',
        metadata: null,
        created_at: new Date().toISOString()
      }

      setStreamedMessage(tempMessage)

      const assistantContent = await streamResponse(message, selectedDocumentIds, chatIdToUse)

      // Persist assistant final message
      await createMessage({
        variables: {
          input: {
            chat_id: chatIdToUse,
            role: 'assistant',
            content: assistantContent
          }
        }
      })

      // Wait for refetch to complete so new messages are in the Apollo cache
      await refetchMessages()
      void refetchChat()

      // Clear optimistic & streamed messages AFTER cache is updated 
      // preventing the message list from shrinking and losing scroll position
      setStreamedMessage(null)
      setOptimisticMessages([])
    } catch (sendError) {
      setStreamedMessage(null)
      const messageText = toErrorMessage(sendError)
      setErrorMessage(messageText)
    }
  }

  const selectedCount = selectedDocumentIds.length

  // render chat messages
  const renderChatMessages = () => {
    if (chatLoading && activeChatId && !chatData?.chat) {
      return (
        <div className='py-6 space-y-6 px-4 md:px-6 w-full max-w-3xl mx-auto flex flex-col justify-end min-h-[50vh]'>
           {/* Same matching skeleton style for chat load */}
           <div className='flex gap-4 max-w-3xl'>
             <div className='size-8 rounded-full shrink-0 flex items-center justify-center bg-muted/60'>
               <Skeleton className='size-5 rounded-full bg-transparent' />
             </div>
             <div className='flex-1 space-y-3 pt-1'>
               <Skeleton className='h-4 w-24' />
               <Skeleton className='h-4 w-full' />
               <Skeleton className='h-4 w-[60%]' />
             </div>
           </div>
        </div>
      )
    } else {
      return (
        <ChatMessageList
          messages={displayedMessages}
          isLoading={messagesLoading && displayedMessages.length === 0}
          streamedMessage={streamPreview}
          streamedContent={streamedContent}
          onLoadMore={handleLoadMore}
          hasMore={!!messagesData?.messages?.hasMore}
          isFetchingMore={messagesLoading && displayedMessages.length > 0}
        />
      )
    }
  }

  // render error
  const renderError = () => {
    if (displayErrorMessage) {
      return (
        <div className='mx-4 mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3'>
          <AlertCircle className='size-5 shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium'>{displayErrorMessage}</p>
          </div>
        </div>
      )
    }
  }

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

      {/* Message area (Virtuoso handles its own scroll logic if used, else standard flex scroll) */}
      <div className='flex-1 min-h-0 overflow-hidden flex flex-col'>
        {renderError()}
        {!activeChatId ? (
          <ScrollArea className='flex-1 w-full'>
            <div className='max-w-3xl mx-auto w-full py-12'>
              <NewChatSetup onCreateChat={handleCreateChat} isLoading={creatingChat} />
            </div>
          </ScrollArea>
        ) : (
          renderChatMessages()
        )}
      </div>

      {/* Composer — pinned at bottom, outside scroll area */}
      {activeChatId && (
        <div className='shrink-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3'>
          <div className='max-w-3xl mx-auto flex flex-col gap-2'>
            <ChatComposer
              disabled={false}
              isStreaming={isStreaming}
              selectedCount={selectedCount}
              isAllSelected={selectedDocumentIds.includes('ALL')}
              onSend={handleSendMessage}
            />
            <p className='text-[10px] text-center text-muted-foreground'>
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
