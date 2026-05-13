'use client'

import { FileText, FileCode, File, BookOpen, type LucideProps } from 'lucide-react'
import { getDocumentKind } from '@/utils/documents/documentKind'
import { cn } from '@/lib/utils'

type DocumentTypeIconProps = {
  mimeType?: string | null
  fileName?: string | null
  className?: string
} & LucideProps

export function DocumentTypeIcon({ mimeType, fileName, className, ...props }: DocumentTypeIconProps) {
  const kind = getDocumentKind(mimeType ?? null, fileName ?? null)

  if (kind === 'pdf') {
    return <BookOpen className={cn('text-red-500', className)} {...props} />
  }

  if (kind === 'code' || kind === 'markdown') {
    return <FileCode className={cn('text-blue-500', className)} {...props} />
  }

  if (kind === 'unknown') {
    return <File className={cn('text-muted-foreground', className)} {...props} />
  }

  return <FileText className={cn('text-primary', className)} {...props} />
}
