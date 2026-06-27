'use client'

import { MoreHorizontal, CloudUpload, Eye, Trash2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { UploadModal } from './UploadModal'
import { useDocumentsSidebar } from '../../hooks/useDocumentsSidebar'
import { DocumentTypeIcon } from './DocumentTypeIcon'
import { DocumentStatus } from './DocumentStatus'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function DocumentsSidebar() {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const router = useRouter()
  const {
    documents,
    loading,
    error,
    selectedDocumentIds,
    toggleDocumentSelection,
    uploadModalOpen,
    setUploadModalOpen,
    handleDeleteDocument,
    handleUploadSuccess,
    setSelectedDocumentId,
    activeChatId,
    isDeletingDocument
  } = useDocumentsSidebar()

  const openDeleteConfirm = (id: string) => {
    setSelectedDocumentId(id)
    setConfirmDeleteOpen(true)
  }

  const openDocumentModal = (id: string) => {
    const params = activeChatId ? `?chatId=${activeChatId}` : ''
    router.push(`/documents/${id}${params}`)
  }

  const showInitialSkeletons = loading && documents.length === 0

  const renderDocuments = () => {
    if (showInitialSkeletons) {
      return (
        <div className='space-y-2'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-16 w-full rounded-xl' />
          ))}
        </div>
      )
    }

    if (documents.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
          <div className='p-4 rounded-full bg-muted/30 mb-4'>
            <FileText className='w-8 h-8 text-muted-foreground/50' />
          </div>
          <h3 className='text-sm font-medium'>No documents yet</h3>
          <p className='text-xs text-muted-foreground mt-1 mb-4'>Upload files and start your conversations.</p>
          <Button variant='outline' size='sm' onClick={() => setUploadModalOpen(true)}>
            Upload files
          </Button>
        </div>
      )
    }

    const allSelected = selectedDocumentIds.includes('ALL')

    const allItem = (
      <div
        key='ALL'
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:bg-secondary/50 cursor-pointer',
          allSelected && 'bg-secondary/80 border-secondary-foreground/10'
        )}
        onClick={() => toggleDocumentSelection('ALL')}
      >
        <Checkbox
          checked={allSelected}
          onCheckedChange={() => toggleDocumentSelection('ALL')}
          className='rounded-md shrink-0'
        />
        <div className='p-1.5 rounded-lg bg-primary/10 shrink-0'>
          <FileText className='w-3.5 h-3.5 text-primary' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium truncate leading-none mb-0.5'>All Documents</p>
          <p className='text-[11px] text-muted-foreground'>Use all available documents</p>
        </div>
      </div>
    )

    return (
      <>
        {allItem}
        {documents.map(document => {
          const isSelected = selectedDocumentIds.includes(document.id)

          return (
            <div
              key={document.id}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:bg-secondary/50',
                isSelected && 'bg-secondary/80 border-secondary-foreground/10'
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleDocumentSelection(document.id)}
                className='rounded-md shrink-0'
              />

              <div
                className='flex-1 min-w-0 cursor-pointer'
                onClick={() => toggleDocumentSelection(document.id)}
              >
                <div className='flex items-center gap-2.5 min-w-0 mb-0.5'>
                  <div className='p-1.5 rounded-lg bg-muted shrink-0'>
                    <DocumentTypeIcon
                      mimeType={document.mime_type}
                      fileName={document.original_file_name}
                      className='w-3.5 h-3.5 shrink-0'
                    />
                  </div>
                  <span className='text-sm font-medium truncate leading-none'>
                    {document.title || document.original_file_name}
                  </span>
                </div>
                <DocumentStatus status={document.processing_status} fileSize={document.file_size} />
              </div>

              <div className='opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none'>
                    <MoreHorizontal className='w-4 h-4' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem onClick={() => openDocumentModal(document.id)}>
                      <Eye className='size-4 mr-2' />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400'
                      onClick={() => openDeleteConfirm(document.id)}
                    >
                      <Trash2 className='size-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-6 text-center space-y-4'>
        <div className='p-3 rounded-full bg-destructive/10'>
          <AlertCircle className='w-10 h-10 text-destructive' />
        </div>
        <div>
          <h3 className='text-lg font-semibold'>Could not load documents</h3>
          <p className='text-sm text-muted-foreground mt-1'>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full bg-background overflow-hidden'>
      <div className='p-4 flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>Documents</h2>
          <p className='text-xs text-muted-foreground'>
            {selectedDocumentIds.includes('ALL') ? 'All selected' : `${selectedDocumentIds.length} selected`}
          </p>
        </div>
        <Button size='sm' onClick={() => setUploadModalOpen(true)} className='gap-2 rounded-full px-4'>
          <CloudUpload className='w-4 h-4' />
          Upload
        </Button>
      </div>

      <Separator />

      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-3 space-y-1'>{renderDocuments()}</div>
      </ScrollArea>

      <DeleteConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        isDeleting={isDeletingDocument}
        onConfirm={async () => {
          await handleDeleteDocument()
          setConfirmDeleteOpen(false)
          toast.success('Document deleted')
        }}
      />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        chatId={activeChatId}
        onUploadSuccess={uploaded => {
          handleUploadSuccess()
          toast.success(`${uploaded.length} document${uploaded.length === 1 ? '' : 's'} uploaded successfully.`)
        }}
      />
    </div>
  )
}
