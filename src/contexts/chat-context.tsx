'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface ChatContextType {
  activeChatId: string | null
  selectedDocumentIds: string[]
  setSelectedDocumentIds: (ids: string[]) => void
  toggleDocumentSelection: (id: string) => void
  documentRefetchVersion: number
  triggerDocumentRefetch: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(['ALL'])
  const [documentRefetchVersion, setDocumentRefetchVersion] = useState(0)

  const triggerDocumentRefetch = () => setDocumentRefetchVersion(v => v + 1)

  const pathname = usePathname()
  const [activeChatId, setActiveChatId] = useState<string | null>(
    () => pathname.split('/chat/')[1] ?? null
  )

  useEffect(() => {
    // Only update activeChatId when we land on a real chat route.
    // Intercepted routes (e.g. /documents/[id]) must NOT clear it —
    // otherwise the documents sidebar loses its chatId filter.
    if (pathname.startsWith('/chat/')) {
      setActiveChatId(pathname.split('/chat/')[1] ?? null)
    }
  }, [pathname])

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocumentIds(prev => {
      if (id === 'ALL') {
        return prev.includes('ALL') ? [] : ['ALL']
      }

      const newSelection = prev.filter(docId => docId !== 'ALL')

      if (newSelection.includes(id)) {
        return newSelection.filter(docId => docId !== id)
      } else {
        return [...newSelection, id]
      }
    })
  }

  return (
    <ChatContext.Provider
      value={{
        activeChatId,
        selectedDocumentIds,
        setSelectedDocumentIds,
        toggleDocumentSelection,
        documentRefetchVersion,
        triggerDocumentRefetch
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
