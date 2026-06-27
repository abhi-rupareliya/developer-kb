'use client'

import { useCallback, useMemo, useState, useRef } from 'react'
import { CloudUpload, Trash2, AlertCircle, FileText, CheckCircle2, Loader2, ClipboardPaste } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  // Tab state
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')

  // Upload tab states
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Paste tab states
  const [pasteText, setPasteText] = useState('')
  const [pasteName, setPasteName] = useState('')
  const [isPasting, setIsPasting] = useState(false)
  const [pasteError, setPasteError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validFiles = useMemo(() => files.filter(f => f.status === 'pending'), [files])

  // ── File upload handlers ──────────────────────────────────────────────────

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    const newFiles: FileWithStatus[] = Array.from(selectedFiles).map(file => {
      const error = validateFile(file)
      return { file, status: error ? 'error' : 'pending', error }
    })
    setSubmitError(null)
    setFiles(current => [...current, ...newFiles])
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      handleFileSelect(event.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleUpload = async () => {
    if (validFiles.length === 0) return
    setIsUploading(true)
    setSubmitError(null)
    setFiles(current =>
      current.map(f => (f.status === 'pending' ? { ...f, status: 'uploading', progress: 0 } : f))
    )

    try {
      const formData = new FormData()
      validFiles.forEach(f => formData.append('files', f.file))
      if (chatId) formData.append('chat_id', chatId)

      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await response.json()

      if (!response.ok || !result.success) throw new Error(result.error || 'Upload failed')

      setFiles(current =>
        current.map(f => (f.status === 'uploading' ? { ...f, status: 'success', progress: 100 } : f))
      )
      onUploadSuccess(result.documents)
      setTimeout(() => setFiles([]), 400)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setSubmitError(message)
      setFiles(current =>
        current.map(f =>
          f.status === 'uploading' ? { ...f, status: 'error', error: message, progress: 0 } : f
        )
      )
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    if (isUploading) return
    setFiles(current => current.filter((_, i) => i !== index))
  }

  // ── Paste content handler ─────────────────────────────────────────────────

  const handlePasteSubmit = async () => {
    const text = pasteText.trim()
    if (!text) return

    setIsPasting(true)
    setPasteError(null)

    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const fileName = pasteName.trim() ? `${pasteName.trim()}.txt` : `Pasted content - ${timeStr}.txt`

      const file = new File([text], fileName, { type: 'text/plain' })
      const formData = new FormData()
      formData.append('files', file)
      if (chatId) formData.append('chat_id', chatId)

      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await response.json()

      if (!response.ok || !result.success) throw new Error(result.error || 'Upload failed')

      setPasteText('')
      setPasteName('')
      onUploadSuccess(result.documents)
    } catch (error) {
      setPasteError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsPasting(false)
    }
  }

  // ── Shared ────────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (isUploading || isPasting) return
    setFiles([])
    setSubmitError(null)
    setPasteText('')
    setPasteName('')
    setPasteError(null)
    onClose()
  }

  const getMaxFileSizeMessage = useMemo(() => {
    const maxSize = Math.round(MAX_FILE_SIZE / (1024 * 1024))
    return `Max ${maxSize}MB per file`
  }, [])

  const renderError = (msg: string | null) => {
    if (!msg) return null
    return (
      <Alert variant='destructive' className='rounded-xl'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
      </Alert>
    )
  }

  const renderFileList = () => {
    if (files.length === 0) return null
    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-semibold'>Selected Files</h4>
          <div className='flex gap-2'>
            <Badge variant='outline' className='rounded-full'>{files.length} Total</Badge>
            <Badge variant='secondary' className='rounded-full'>{validFiles.length} Ready</Badge>
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
                        onClick={e => { e.stopPropagation(); removeFile(index) }}
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
              <DialogTitle className='text-xl'>Add document</DialogTitle>
              <DialogDescription>Upload a file or paste text into your knowledge base.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'upload' | 'paste')} className='flex flex-col flex-1 min-h-0'>
          <TabsList className='mx-6 mt-4 w-fit bg-muted/60 border border-border/40'>
            <TabsTrigger
              value='upload'
              className={cn(activeTab === 'upload' && 'bg-background text-foreground shadow-sm dark:bg-accent dark:text-accent-foreground')}
            >
              <CloudUpload className='w-3.5 h-3.5 mr-1.5' />
              Upload file
            </TabsTrigger>
            <TabsTrigger
              value='paste'
              className={cn(activeTab === 'paste' && 'bg-background text-foreground shadow-sm dark:bg-accent dark:text-accent-foreground')}
            >
              <ClipboardPaste className='w-3.5 h-3.5 mr-1.5' />
              Paste content
            </TabsTrigger>
          </TabsList>

          {/* ── Upload tab ─────────────────────────────────────────── */}
          <TabsContent value='upload' className='flex flex-col flex-1 min-h-0 mt-0'>
            <div className='flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4'>
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
                onClick={() => fileInputRef.current?.click()}
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

              {renderError(submitError)}
              {renderFileList()}
            </div>

            <Separator />
            <DialogFooter className='border-t bg-muted/20 pb-8 pr-8'>
              <Button variant='ghost' onClick={handleClose} disabled={isUploading}>Cancel</Button>
              <Button onClick={handleUpload} disabled={validFiles.length === 0 || isUploading}>
                {isUploading ? (
                  <><Loader2 className='w-4 h-4 animate-spin' />Uploading...</>
                ) : (
                  <><CloudUpload className='w-4 h-4' />Upload files</>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── Paste tab ──────────────────────────────────────────── */}
          <TabsContent value='paste' className='flex flex-col flex-1 min-h-0 mt-0'>
            <div className='flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Document name (optional)
                </label>
                <input
                  type='text'
                  value={pasteName}
                  onChange={e => setPasteName(e.target.value)}
                  placeholder='e.g. API reference notes'
                  className='w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/60'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Content
                </label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder='Paste or type your content here…'
                  rows={10}
                  className='w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/60 resize-none font-mono leading-relaxed'
                />
                <p className='text-[10px] text-muted-foreground text-right'>
                  {pasteText.length.toLocaleString()} characters
                </p>
              </div>

              {renderError(pasteError)}
            </div>

            <Separator />
            <DialogFooter className='border-t bg-muted/20 pb-8 pr-8'>
              <Button variant='ghost' onClick={handleClose} disabled={isPasting}>Cancel</Button>
              <Button onClick={() => void handlePasteSubmit()} disabled={!pasteText.trim() || isPasting}>
                {isPasting ? (
                  <><Loader2 className='w-4 h-4 animate-spin' />Saving...</>
                ) : (
                  <><ClipboardPaste className='w-4 h-4' />Save as document</>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
