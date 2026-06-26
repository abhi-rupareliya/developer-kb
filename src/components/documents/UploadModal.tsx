'use client'

import { useCallback, useMemo, useState, useRef } from 'react'
import { CloudUpload, Trash2, AlertCircle, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/Uploads'
import { Document } from '@/types/graphql'
import { validateFile } from '@/utils/documents/valiateFile'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUploadSuccess: (documents: Document[]) => void
  chatId?: string | null
}

interface FileWithStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string | null
  progress?: number
}

export function UploadModal({ open, onClose, onUploadSuccess, chatId }: UploadModalProps) {
  // States
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Computed values
  const validFiles = useMemo(() => files.filter(file => file.status === 'pending'), [files])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileWithStatus[] = Array.from(selectedFiles).map(file => {
      const error = validateFile(file)
      return {
        file,
        status: error ? 'error' : 'pending',
        error
      }
    })

    setSubmitError(null)
    setFiles(current => [...current, ...newFiles])
  }, [])

  // Handle file drop
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      handleFileSelect(event.dataTransfer.files)
    },
    [handleFileSelect]
  )

  // Handle file upload
  const handleUpload = async () => {
    if (validFiles.length === 0) return

    setIsUploading(true)
    setSubmitError(null)
    setFiles(current =>
      current.map(file => (file.status === 'pending' ? { ...file, status: 'uploading', progress: 0 } : file))
    )

    try {
      const formData = new FormData()
      validFiles.forEach(file => {
        formData.append('files', file.file)
      })

      console.log('chatId', chatId)

      if (chatId) {
        formData.append('chat_id', chatId)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      setFiles(current =>
        current.map(file => (file.status === 'uploading' ? { ...file, status: 'success', progress: 100 } : file))
      )

      onUploadSuccess(result.documents)
      setTimeout(() => {
        setFiles([])
      }, 400)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setSubmitError(message)
      setFiles(current =>
        current.map(file =>
          file.status === 'uploading' ? { ...file, status: 'error', error: message, progress: 0 } : file
        )
      )
    } finally {
      setIsUploading(false)
    }
  }

  // Handle close modal
  const handleClose = () => {
    if (isUploading) return
    setFiles([])
    setSubmitError(null)
    onClose()
  }

  // Remove file
  const removeFile = (index: number) => {
    if (isUploading) return
    setFiles(current => current.filter((_, currentIndex) => currentIndex !== index))
  }

  // Handle drag over
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  // Handle drag leave
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  // Handle dropdzone click
  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  // get max file size message
  const getMaxFileSizeMessage = useMemo(() => {
    const maxSize = Math.round(MAX_FILE_SIZE / (1024 * 1024))

    return `Max ${maxSize}MB per file`
  }, [])

  // Render error alert
  const renderError = () => {
    if (!submitError) return null
    return (
      <Alert variant='destructive' className='rounded-xl'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{submitError}</AlertDescription>
      </Alert>
    )
  }

  // Render selected files list
  const renderFileList = () => {
    if (files.length === 0) return null
    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-semibold'>Selected Files</h4>
          <div className='flex gap-2'>
            <Badge variant='outline' className='rounded-full'>
              {files.length} Total
            </Badge>
            <Badge variant='secondary' className='rounded-full'>
              {validFiles.length} Ready
            </Badge>
          </div>
        </div>

        <ScrollArea className='max-h-[220px] rounded-xl border bg-muted/30'>
          <div className='divide-y divide-border'>
            {files.map((fileWithStatus, index) => (
              <div key={index} className='flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors'>
                <FileText className='w-5 h-5 text-muted-foreground shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs font-medium truncate'>{fileWithStatus.file.name}</p>
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {fileWithStatus.status === 'success' && <CheckCircle2 className='w-4 h-4 text-green-500' />}
                      {fileWithStatus.status === 'error' && <AlertCircle className='w-4 h-4 text-destructive' />}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 rounded-full text-muted-foreground hover:text-destructive'
                        onClick={e => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        disabled={isUploading}
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 mt-1'>
                    <div className='flex items-center justify-between text-[10px] text-muted-foreground uppercase font-medium'>
                      <span>{(fileWithStatus.file.size / 1024).toFixed(1)} KB</span>
                      {fileWithStatus.status === 'uploading' && <span>{fileWithStatus.progress}%</span>}
                    </div>
                    {fileWithStatus.status === 'uploading' && (
                      <Progress value={fileWithStatus.progress || null} className='h-1' />
                    )}
                    {fileWithStatus.error && (
                      <p className='text-[10px] text-destructive font-medium'>{fileWithStatus.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-none'>
        <DialogHeader className='p-6 pb-0'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-full bg-primary/10'>
              <CloudUpload className='w-5 h-5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-xl'>Upload documents</DialogTitle>
              <DialogDescription>Add documents to your knowledge base.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body — grows between header and footer */}
        <div className='flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4'>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleDropZoneClick}
            className={cn(
              'group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer transition-all duration-200',
              dragOver
                ? 'border-primary bg-primary/5 scale-[0.99]'
                : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/5'
            )}
          >
            <CloudUpload
              className={cn(
                'w-12 h-12 mb-4 transition-colors',
                dragOver ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-primary/60'
              )}
            />
            <div className='text-center'>
              <p className='text-sm font-medium'>Click to upload or drag and drop</p>
              <p className='text-xs text-muted-foreground mt-1'>Supported: {SUPPORTED_EXTENSIONS.join(', ')}</p>
              <p className='text-xs text-muted-foreground'>{getMaxFileSizeMessage}</p>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept={SUPPORTED_EXTENSIONS.join(',')}
              className='hidden'
              onChange={event => handleFileSelect(event.target.files)}
            />
          </div>

          {renderError()}
          {renderFileList()}
        </div>

        <Separator />

        <DialogFooter className='border-t bg-muted/20 pb-8 pr-8'>
          <Button variant='ghost' onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={validFiles.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <CloudUpload className='w-4 h-4' />
                Upload files
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
