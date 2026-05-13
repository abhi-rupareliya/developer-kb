'use client'

import { useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreVertical, Trash2, History, MessageSquare, Sun, Moon } from 'lucide-react'

import { GET_CHATS } from '@/graphql/queries'
import { DELETE_CHAT } from '@/graphql/mutations'
import { Chat } from '@/types/graphql'
import { getDateGroup } from '@/utils/dateGroups'
import { cn } from '@/lib/utils'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

type ChatHistorySidebarProps = {
  activeChatId: string | null
}

type ChatGroup = {
  label: 'Today' | 'Yesterday' | 'Older'
  chats: Chat[]
}

export function ChatHistorySidebar({ activeChatId }: ChatHistorySidebarProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { data, loading, error, refetch } = useQuery<{ chats: Chat[] }>(GET_CHATS)
  const [deleteChat, { loading: isDeleting }] = useMutation(DELETE_CHAT)

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const chats = useMemo(() => data?.chats ?? [], [data?.chats])

  const groupedChats = useMemo<ChatGroup[]>(() => {
    const filtered = chats
      .filter(chat => chat.title?.toLowerCase().includes(search.toLowerCase()) || !search.trim())
      .slice()
      .sort((a, b) => +new Date(b.updated_at || b.created_at) - +new Date(a.updated_at || a.created_at))

    const grouped: Record<ChatGroup['label'], Chat[]> = {
      Today: [],
      Yesterday: [],
      Older: []
    }

    filtered.forEach(chat => {
      grouped[getDateGroup(chat.updated_at || chat.created_at)].push(chat)
    })

    return (['Today', 'Yesterday', 'Older'] as const)
      .map(label => ({ label, chats: grouped[label] }))
      .filter(group => group.chats.length > 0)
  }, [chats, search])

  const handleCreateChat = () => {
    router.push('/chat/new')
  }

  const handleDeleteChat = async () => {
    if (!selectedChatId) return
    try {
      await deleteChat({ variables: { id: selectedChatId } })
      if (activeChatId === selectedChatId) {
        router.push('/chat/new')
      }
      await refetch()
      setConfirmDeleteOpen(false)
      setSelectedChatId(null)
    } catch (mutationError) {
      console.error('Failed to delete chat:', mutationError)
    }
  }

  return (
    <div className='flex flex-col h-full bg-background overflow-hidden'>
      {/* Header */}
      <div className='shrink-0 p-3 space-y-2'>
        <Button
          onClick={handleCreateChat}
          variant='outline'
          className='w-full justify-start gap-2 border-dashed border-2 hover:border-primary/50 transition-all'
        >
          <Plus className='size-4' />
          <span>New Chat</span>
        </Button>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none' />
          <Input
            placeholder='Search chats...'
            className='pl-9 h-9'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list — scrollable */}
      <ScrollArea className='flex-1'>
        <div className='px-2 pb-2'>
          {loading ? (
            <div className='space-y-1 px-1 pt-1'>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className='h-9 w-full rounded-md' />
              ))}
            </div>
          ) : error ? (
            <div className='p-4 text-center'>
              <p className='text-sm text-destructive mb-2'>Failed to load chats</p>
              <Button size='sm' variant='ghost' onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : groupedChats.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center text-muted-foreground'>
              <History className='size-8 mb-2 opacity-20' />
              <p className='text-sm'>{search ? 'No chats found' : 'No chats yet'}</p>
            </div>
          ) : (
            groupedChats.map(group => (
              <div key={group.label} className='mb-3'>
                <p className='px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                  {group.label}
                </p>
                <div className='space-y-0.5'>
                  {group.chats.map(chat => (
                    <div
                      key={chat.id}
                      className={cn(
                        'group/item relative flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                        activeChatId === chat.id
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50 text-foreground/80'
                      )}
                      onClick={() => router.push(`/chat/${chat.id}`)}
                    >
                      <MessageSquare className='size-4 shrink-0 opacity-60' />
                      <span className='truncate flex-1 font-normal leading-snug'>{chat.title || 'Untitled Chat'}</span>

                      {/* Actions menu — show on hover */}
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button
                            className='opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-accent-foreground/10'
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreVertical className='size-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuItem
                            className='text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400'
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedChatId(chat.id)
                              setConfirmDeleteOpen(true)
                            }}
                          >
                            <Trash2 className='size-4 mr-2' />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className='shrink-0 border-t p-3'>
        <div className='flex items-center gap-2 px-2 py-1.5 rounded-lg'>
          <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs shrink-0'>
            JD
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>User Name</p>
            <p className='text-xs text-muted-foreground truncate'>user@example.com</p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground'
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? <Sun className='size-4' /> : <Moon className='size-4' />}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                handleDeleteChat()
              }}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
