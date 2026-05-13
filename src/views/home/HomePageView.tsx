'use client'

import { ChatWorkspace } from '@/components/chat/ChatWorkspace'

type HomePageViewProps = {
  activeChatId: string | null
  isDraftChat: boolean
}

export function HomePageView({ activeChatId, isDraftChat }: HomePageViewProps) {
  return <ChatWorkspace activeChatId={activeChatId} isDraftChat={isDraftChat} />
}
