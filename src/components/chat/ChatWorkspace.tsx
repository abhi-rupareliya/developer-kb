'use client'

import { useState } from 'react'
import { ChatHistorySidebar } from '@/components/history/ChatHistorySidebar'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { DocumentsSidebar } from '@/components/documents/DocumentsSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, History, FileText } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

type ChatWorkspaceProps = {
  activeChatId: string | null
}

export function ChatWorkspace({ activeChatId }: ChatWorkspaceProps) {
  const isMobile = useIsMobile()
  const [historyOpen, setHistoryOpen] = useState(true)

  if (isMobile) {
    return (
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <Tabs defaultValue='history' className='flex flex-col h-full w-full'>
          <div className='px-4 py-2 border-b shrink-0'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='history' className='flex items-center gap-2'>
                <History className='size-4' />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value='chat' className='flex items-center gap-2'>
                <MessageSquare className='size-4' />
                <span>Chat</span>
              </TabsTrigger>
              {activeChatId && (
                <TabsTrigger value='documents' className='flex items-center gap-2'>
                  <FileText className='size-4' />
                  <span>Docs</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <div className='flex-1 overflow-hidden'>
            <TabsContent value='chat' className='h-full m-0 data-[state=inactive]:hidden'>
              <ChatMessages activeChatId={activeChatId} historyOpen={false} />
            </TabsContent>
            <TabsContent value='history' className='h-full m-0 data-[state=inactive]:hidden'>
              <ChatHistorySidebar activeChatId={activeChatId} />
            </TabsContent>
            {activeChatId && (
              <TabsContent value='documents' className='h-full m-0 data-[state=inactive]:hidden'>
                <DocumentsSidebar />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    )
  }

  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      {/* History sidebar — plain flex panel */}
      {historyOpen && (
        <div className='w-[260px] shrink-0 border-r flex flex-col overflow-hidden'>
          <ChatHistorySidebar activeChatId={activeChatId} />
        </div>
      )}

      {/* Chat area */}
      <div className='flex-1 min-w-0 h-full overflow-hidden'>
        <ChatMessages
          activeChatId={activeChatId}
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen(prev => !prev)}
        />
      </div>

      {/* Documents sidebar */}
      {activeChatId && (
        <div className='w-[300px] shrink-0 border-l hidden xl:flex xl:flex-col overflow-hidden'>
          <DocumentsSidebar />
        </div>
      )}
    </div>
  )
}
