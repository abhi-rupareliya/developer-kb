'use client'

import { MoreVertical, CloudUpload, Eye, Trash2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { Skeleton } from '@/components/ui/skeleton'
import { UploadModal } from './UploadModal'
import { useDocumentsSidebar } from './useDocumentsSidebar'
import { DocumentTypeIcon } from './DocumentTypeIcon'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function DocumentsSidebar() {
  const {
    documents,
    loading,
    error,
    selectedDocumentIds,
    toggleDocumentSelection,
    selectedDocumentId,
    uploadModalOpen,
    setUploadModalOpen,
    handleDeleteDocument,
    handleUploadSuccess,
    setSelectedDocumentId
  } = useDocumentsSidebar()

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const openDeleteConfirm = (id: string) => {
    setSelectedDocumentId(id)
    setConfirmDeleteOpen(true)
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
    <div className='flex flex-col h-full bg-background'>
      <div className='p-4 flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>Documents</h2>
          <p className='text-xs text-muted-foreground'>{selectedDocumentIds.length} selected for grounding</p>
        </div>
        <Button size='sm' onClick={() => setUploadModalOpen(true)} className='gap-2 rounded-full px-4'>
          <CloudUpload className='w-4 h-4' />
          Upload
        </Button>
      </div>

      <Separator />

      <ScrollArea className='flex-1'>
        <div className='p-3 space-y-1'>
          {loading ? (
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-16 w-full rounded-xl' />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
              <div className='p-4 rounded-full bg-muted/30 mb-4'>
                <FileText className='w-8 h-8 text-muted-foreground/50' />
              </div>
              <h3 className='text-sm font-medium'>No documents yet</h3>
              <p className='text-xs text-muted-foreground mt-1 mb-4'>
                Upload files to start grounding your conversations.
              </p>
              <Button variant='outline' size='sm' onClick={() => setUploadModalOpen(true)}>
                Upload files
              </Button>
            </div>
          ) : (
            documents.map(document => {
              const isSelected = selectedDocumentIds.includes(document.id)
              const isFailed = document.processing_status === 'failed'
              const isProcessing =
                document.processing_status === 'processing' || document.processing_status === 'pending'

              return (
                <div
                  key={document.id}
                  className={cn(
                    'group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-secondary/50',
                    isSelected && 'bg-secondary/80 border-secondary-foreground/10'
                  )}
                >
                  <div className='pt-1'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDocumentSelection(document.id)}
                      className='rounded-md'
                    />
                  </div>

                  <div
                    className='flex-1 min-w-0 space-y-1 cursor-pointer'
                    onClick={() => toggleDocumentSelection(document.id)}
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <DocumentTypeIcon
                        mimeType={document.mime_type}
                        fileName={document.original_file_name}
                        className='w-4 h-4 shrink-0'
                      />
                      <span className='text-sm font-medium truncate leading-none'>
                        {document.title || document.original_file_name}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      {isFailed && (
                        <Badge
                          variant='destructive'
                          className='h-4 px-1.5 text-[10px] uppercase font-bold tracking-wider'
                        >
                          Failed
                        </Badge>
                      )}
                      {isProcessing && (
                        <Badge
                          variant='outline'
                          className='h-4 px-1.5 text-[10px] uppercase font-bold tracking-wider animate-pulse'
                        >
                          Processing
                        </Badge>
                      )}
                      {document.file_size && (
                        <span className='text-[10px] text-muted-foreground uppercase font-medium'>
                          {Math.max(1, Math.round(document.file_size / 1024))} KB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full'>
                          <MoreVertical className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuItem>
                          <Link href={`/documents/${document.id}`} className='flex items-center gap-2'>
                            <Eye className='w-4 h-4' />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400 flex items-center gap-2'
                          onClick={() => openDeleteConfirm(document.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This document will be removed from the knowledge base and cannot be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocumentId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={async () => {
                await handleDeleteDocument()
                toast.success('Document deleted')
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={uploaded => {
          handleUploadSuccess()
          toast.success(`${uploaded.length} document${uploaded.length === 1 ? '' : 's'} uploaded successfully.`)
        }}
      />
    </div>
  )
}
