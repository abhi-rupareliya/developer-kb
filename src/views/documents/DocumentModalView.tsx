'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_DOCUMENTS } from '@/graphql/queries'
import { Document } from '@/types/graphql'
import { DocumentContent } from '@/components/documents/DocumentContent'
import { X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function DocumentModalView({ documentId }: { documentId: string }) {
  const router = useRouter()
  const { data, loading, error: queryError } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS)

  const documents = data?.documents || []
  const document = documents.find(doc => doc.id === documentId)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background gap-0 sm:max-w-[800px]'>
        <DialogHeader className='px-6 py-4 border-b shrink-0'>
          <div className='flex items-center justify-between gap-4'>
            <DialogTitle className='text-lg font-semibold truncate leading-none'>
              {document?.title || document?.original_file_name || 'Document'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-auto  w-full'>
          {queryError ? (
            <div className='p-8 text-center'>
              <p className='text-destructive font-medium'>Failed to load document</p>
              <p className='text-sm text-muted-foreground mt-1'>{queryError.message}</p>
            </div>
          ) : loading || !document ? (
            <div className='h-full flex flex-col items-center justify-center gap-3'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              <p className='text-sm text-muted-foreground font-medium'>
                {loading ? 'Loading document...' : 'Document not found'}
              </p>
            </div>
          ) : (
            <div className='p-2'>
              <DocumentContent document={document} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
