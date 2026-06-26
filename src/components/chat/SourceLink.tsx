'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SourceLinkProps {
  href: string
  children: ReactNode
}

export function SourceLink({ href, children }: SourceLinkProps) {
  const router = useRouter()
  const isSourceRef = href?.toLowerCase().startsWith('documents/')
  const documentId = href.split('/').pop()
  const navigateToSource = () => router.push(`/documents/${documentId}`)

  if (isSourceRef) {
    return (
      <Badge
        variant='secondary'
        className='mx-0.5 gap-1.5 rounded-full px-2 py-0 cursor-pointer font-medium hover:bg-secondary/80 transition-colors inline-flex items-center'
        onClick={navigateToSource}
      >
        <FileText className='size-3.5 shrink-0' />
        {children}
      </Badge>
    )
  }

  return (
    <Link
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary hover:underline underline-offset-2 decoration-primary/40 font-medium'
    >
      {children}
    </Link>
  )
}
