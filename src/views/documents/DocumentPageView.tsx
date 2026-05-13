'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_DOCUMENTS } from '@/graphql/queries'
import { Document } from '@/types/graphql'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DocumentContent } from '@/components/documents/DocumentContent'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DocumentPageView({ id }: { id: string }) {
  const router = useRouter()
  const { data, loading, error: queryError } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS)

  const documents = data?.documents || []
  const document = documents.find(doc => doc.id === id)

  if (queryError) {
    return (
      <div className='container mx-auto max-w-7xl py-6 px-4'>
        <Alert variant='destructive'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className='flex items-center justify-between'>
            <span>Failed to load documents: {queryError.message}</span>
            <Button variant='outline' size='sm' onClick={() => router.back()}>
              Back
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading || !document) {
    return (
      <div className='container mx-auto max-w-7xl py-6 px-4'>
        <div className='min-h-[70vh] grid place-items-center'>
          <div className='flex flex-col items-center gap-4'>
            {loading ? (
              <>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                <p className='text-muted-foreground text-sm'>Loading document...</p>
              </>
            ) : (
              <>
                <p className='text-muted-foreground text-sm font-medium'>Document not found</p>
                <Button variant='outline' size='sm' onClick={() => router.back()}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-7xl py-6 px-4 space-y-6'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>

      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-1'>
          {document.title || document.original_file_name || 'Document'}
        </h1>
        <p className='text-sm text-muted-foreground'>{document.original_file_name}</p>
      </div>

      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <DocumentContent document={document} />
      </div>
    </div>
  )
}
