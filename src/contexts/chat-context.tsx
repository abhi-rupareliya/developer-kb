'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface ChatContextType {
  activeChatId: string | null
  selectedDocumentIds: string[]
  setSelectedDocumentIds: (ids: string[]) => void
  toggleDocumentSelection: (id: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(['ALL'])

  const activeChatId = usePathname().split('/chat/')[1]

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
