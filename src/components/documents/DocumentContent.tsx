'use client'

import { useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf'
import { getDocumentKind } from '@/utils/documents/documentKind'
import { useDocumentContent } from '../../hooks/useDocumentContent'
import { Document } from '@/types/graphql'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { getLanguage } from '@/utils/documents/getLanguage'

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

// Loading PDF component
function LoadingPDF() {
  return (
    <div className='flex flex-col items-center py-20 gap-3'>
      <Loader2 className='w-6 h-6 animate-spin text-primary' />
      <span className='text-sm text-muted-foreground'>Rendering PDF...</span>
    </div>
  )
}

// Error PDF component
function ErrorPDF() {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load PDF</AlertDescription>
    </Alert>
  )
}

export function DocumentContent({ document }: DocumentContentProps) {
  // States
  const [pageNumber, setPageNumber] = useState(1)

  const kind = getDocumentKind(document.mime_type, document.original_file_name)
  const codeLanguage = getLanguage(document?.original_file_name)

  // Hooks
  const { content, loading, error } = useDocumentContent(kind === 'markdown' || kind === 'code' ? document.id : null)
  const [numPages, setNumPages] = useState<number | null>(null)

  const windowWidth = useWindowWidth()

  if (error) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
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
    return (
      <div className='max-w-4xl mx-auto px-4 md:px-8 py-6'>
        <ChatCodeBlock language={codeLanguage}>{content}</ChatCodeBlock>
      </div>
    )
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
            loading={<LoadingPDF />}
            error={<ErrorPDF />}
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
}
