'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport, type UIMessage } from 'ai'

function getMessageText(message?: UIMessage) {
  if (!message) return ''

  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

export function useChatStreaming() {
  const lastAssistantTextRef = useRef('')

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            question: getMessageText(messages[messages.length - 1]),
            documentIds: (body as { documentIds?: string[] } | undefined)?.documentIds ?? [],
            chatId: (body as { chatId?: string | null } | undefined)?.chatId ?? null
          }
        })
      }),
    []
  )

  const { sendMessage, setMessages, status, messages } = useChat({
    transport,
    onFinish: ({ message }) => {
      lastAssistantTextRef.current = getMessageText(message)
    }
  })

  const isStreaming = status === 'submitted' || status === 'streaming'
  const lastMessage = messages[messages.length - 1]
  const streamedContent = lastMessage?.role === 'assistant' ? getMessageText(lastMessage) : ''

  const streamResponse = useCallback(
    async (question: string, documentIds: string[], chatId?: string) => {
      lastAssistantTextRef.current = ''
      setMessages([])

      await sendMessage({ text: question }, { body: { documentIds, chatId: chatId ?? null } })

      return lastAssistantTextRef.current
    },
    [sendMessage, setMessages]
  )

  return {
    isStreaming,
    streamedContent,
    streamResponse
  }
}
