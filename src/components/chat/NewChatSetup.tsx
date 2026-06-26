'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquarePlus, Sparkles, Loader2 } from 'lucide-react'

type NewChatSetupProps = {
  onCreateChat: (title: string) => Promise<void>
  isLoading: boolean
}

export function NewChatSetup({ onCreateChat, isLoading }: NewChatSetupProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && !isLoading) {
      void onCreateChat(title.trim())
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='mb-8 relative'>
        <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-20 blur-xl animate-pulse' />
        <div className='relative size-20 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl border border-primary/10'>
          <MessageSquarePlus className='size-10 text-primary' />
        </div>
      </div>

      <Card className='w-full max-w-md border-none bg-transparent shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent'>
            Start a New Conversation
          </CardTitle>
          <CardDescription className='text-base'>
            Give your chat a name to organize your thoughts and start chatting with DeveloperKB.
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2 text-left'>
              <label htmlFor='chat-title' className='text-sm font-medium pl-1'>
                Conversation Title
              </label>
              <Input
                id='chat-title'
                placeholder='e.g., Debugging Auth Issues, Code Review...'
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isLoading}
                className='h-12 bg-secondary/30 border-primary/10 focus-visible:ring-primary/20 text-base'
                autoFocus
              />
            </div>
            <Button
              type='submit'
              className='w-full h-12 text-base font-semibold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40'
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 size-5 animate-spin' />
                  Creating Chat...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 size-5' />
                  Initialize Conversation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className='mt-12 grid grid-cols-2 gap-4 w-full max-w-lg'>
        <div className='p-4 rounded-xl bg-secondary/20 border border-primary/5 text-left'>
          <div className='size-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3'>
            <div className='size-2 rounded-full bg-primary' />
          </div>
          <h4 className='font-semibold text-sm mb-1'>Organized History</h4>
          <p className='text-xs text-muted-foreground'>Keep your projects separate and easy to find later.</p>
        </div>
        <div className='p-4 rounded-xl bg-secondary/20 border border-primary/5 text-left'>
          <div className='size-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3'>
            <div className='size-2 rounded-full bg-primary' />
          </div>
          <h4 className='font-semibold text-sm mb-1'>Better RAG Context</h4>
          <p className='text-xs text-muted-foreground'>Attach specific documents to each chat for focused answers.</p>
        </div>
      </div>
    </div>
  )
}
