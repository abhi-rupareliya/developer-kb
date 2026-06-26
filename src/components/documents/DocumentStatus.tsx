'use client'

import { Badge } from '@/components/ui/badge'
import { PROCESSING_STATUS } from '@/constants/Uploads'

interface DocumentStatusProps {
  status: string
  fileSize?: number | null
}

export function DocumentStatus({ status, fileSize }: DocumentStatusProps) {
  const isFailed = status === PROCESSING_STATUS.FAILED
  const isProcessing = status === PROCESSING_STATUS.PROCESSING

  if (!isFailed && !isProcessing && !fileSize) return null

  if (isFailed) {
    return (
      <Badge variant='destructive' className='h-4 px-1.5 text-[10px] uppercase font-bold tracking-wider'>
        Failed
      </Badge>
    )
  }

  if (isProcessing) {
    return (
      <Badge variant='outline' className='h-4 px-1.5 text-[10px] uppercase font-bold tracking-wider animate-pulse'>
        Processing
      </Badge>
    )
  }
}
