'use client'

import { useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react'
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf'
import { getDocumentKind } from '@/utils/documents/documentKind'
import { useDocumentContent } from './useDocumentContent'
import { Document } from '@/types/graphql'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWindowWidth } from '@/hooks/useWindowWidth'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

if (typeof DOMMatrix === 'undefined') {
  // @ts-expect-error - DOMMatrix polyfill for PDF.js compatibility
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      return this
    }
  }
}

interface DocumentContentProps {
  document: Document
}

function getLanguage(filename?: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'jsx':
      return 'jsx'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'cpp':
    case 'c':
      return 'cpp'
    case 'cs':
      return 'csharp'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    case 'sql':
      return 'sql'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'md':
      return 'markdown'
    case 'sh':
      return 'bash'
    default:
      return 'text'
  }
}

export function DocumentContent({ document }: DocumentContentProps) {
  const kind = getDocumentKind(document.mime_type, document.original_file_name)
  const {
    content,
    loading: contentLoading,
    error: fetchError
  } = useDocumentContent(kind === 'markdown' || kind === 'code' ? document.id : null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  const windowWidth = useWindowWidth()

  if (fetchError) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    )
  }

  if (contentLoading) {
    return (
      <div className='min-h-[400px] flex flex-col items-center justify-center gap-3'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
        <p className='text-sm text-muted-foreground animate-pulse'>Loading content...</p>
      </div>
    )
  }

  if (kind === 'markdown' && content) {
    return (
      <div className='max-w-4xl mx-auto px-4 md:px-8 py-6'>
        <ChatMarkdown content={content} />
      </div>
    )
  }

  if (kind === 'code' && content) {
    return <ChatCodeBlock language={getLanguage(document.original_file_name)}>{content}</ChatCodeBlock>
  }

  if (kind === 'pdf') {
    return (
      <div className='flex flex-col h-full bg-muted/30 rounded-xl overflow-hidden border shadow-sm'>
        <div className='flex items-center justify-between p-3 border-b bg-background'>
          <span className='text-sm font-medium text-muted-foreground ml-2'>PDF Preview</span>
          {numPages && numPages > 1 && (
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full'
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(v => v - 1)}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span className='text-sm font-medium'>
                {pageNumber} <span className='text-muted-foreground mx-1'>/</span> {numPages}
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full'
                disabled={pageNumber === numPages}
                onClick={() => setPageNumber(v => v + 1)}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          )}
        </div>

        <div className='flex-1 overflow-auto bg-muted/50 flex justify-center p-4'>
          <PDFDocument
            file={`/api/documents/${document.id}`}
            onLoadSuccess={({ numPages: nextNumPages }) => setNumPages(nextNumPages)}
            loading={
              <div className='flex flex-col items-center py-20 gap-3'>
                <Loader2 className='w-6 h-6 animate-spin text-primary' />
                <span className='text-sm text-muted-foreground'>Rendering PDF...</span>
              </div>
            }
            error={
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load PDF</AlertDescription>
              </Alert>
            }
          >
            <PDFPage
              pageNumber={pageNumber}
              width={Math.min(750, windowWidth - 64)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className='shadow-xl rounded-sm overflow-hidden'
            />
          </PDFDocument>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8 max-w-2xl mx-auto'>
      <Alert className='bg-secondary/30 border-none shadow-none rounded-2xl p-6'>
        <Info className='h-5 w-5 text-primary' />
        <AlertTitle className='text-lg font-semibold ml-2'>Preview Unavailable</AlertTitle>
        <AlertDescription className='mt-2 text-muted-foreground leading-relaxed ml-2'>
          This file type is stored and indexed for search, but inline previewing is currently unsupported. You can still
          use it as context in your chats.
        </AlertDescription>
      </Alert>
    </div>
  )
}
