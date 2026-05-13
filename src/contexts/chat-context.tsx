'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  selectedDocumentIds: string[]
  setSelectedDocumentIds: (ids: string[]) => void
  toggleDocumentSelection: (id: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocumentIds(prev => (prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]))
  }

  return (
    <ChatContext.Provider
      value={{
        activeChatId,
        setActiveChatId,
        selectedDocumentIds,
        setSelectedDocumentIds,
        toggleDocumentSelection
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
