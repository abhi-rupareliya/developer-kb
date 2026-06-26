'use client'

import { ChatWorkspace } from '@/components/chat/ChatWorkspace'

type HomePageViewProps = {
  activeChatId: string | null
}

export function HomePageView({ activeChatId }: HomePageViewProps) {
  return <ChatWorkspace activeChatId={activeChatId} />
}
