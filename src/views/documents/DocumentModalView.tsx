'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_DOCUMENTS } from '@/graphql/queries'
import { Document } from '@/types/graphql'
import { DocumentContent } from '@/components/documents/DocumentContent'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function DocumentModalView({ documentId }: { documentId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get('chatId') || undefined

  const { data, loading, error } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS, {
    variables: { chatId }
  })

  const document = (data?.documents ?? []).find(doc => doc.id === documentId)

  return (
    <Dialog open onOpenChange={open => { if (!open) router.back() }}>
      <DialogContent
        showCloseButton
        className='flex flex-col p-0 gap-0 overflow-hidden bg-background
                   w-[min(800px,calc(100vw-2rem))] max-h-[90vh]'
      >
        <DialogHeader className='px-6 py-4 border-b shrink-0'>
          <DialogTitle className='text-base font-semibold truncate leading-none'>
            {document?.title || document?.original_file_name || 'Document'}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full'>
          {error ? (
            <div className='p-8 text-center'>
              <p className='text-destructive font-medium'>Failed to load document</p>
              <p className='text-sm text-muted-foreground mt-1'>{error.message}</p>
            </div>
          ) : loading ? (
            <div className='flex flex-col items-center justify-center h-48 gap-3'>
              <Loader2 className='h-7 w-7 animate-spin text-muted-foreground' />
              <p className='text-sm text-muted-foreground'>Loading document…</p>
            </div>
          ) : !document ? (
            <div className='flex items-center justify-center h-48'>
              <p className='text-sm text-muted-foreground'>Document not found</p>
            </div>
          ) : (
            <div className='w-full'>
              <DocumentContent document={document} compact />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
