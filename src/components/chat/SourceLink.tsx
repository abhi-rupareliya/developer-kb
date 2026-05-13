'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SourceLinkProps {
  href: string
  children: ReactNode
}

export function SourceLink({ href, children }: SourceLinkProps) {
  const router = useRouter()
  const isSourceRef = href?.toLowerCase().startsWith('documents/')

  if (isSourceRef) {
    const documentId = href.split('/').pop()
    return (
      <Badge
        variant='secondary'
        className='mx-0.5 px-2 py-0 cursor-pointer font-medium hover:bg-secondary/80 transition-colors'
        onClick={() => router.push(`/documents/${documentId}`)}
      >
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
