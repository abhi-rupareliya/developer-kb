'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatCodeBlock } from './ChatCodeBlock'
import { SourceLink } from './SourceLink'
import { cn } from '@/lib/utils'

type ChatMarkdownProps = {
  content: string
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className='chat-markdown prose-sm prose-invert max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return !isInline && match ? (
              <ChatCodeBlock language={match[1]}>{String(children)}</ChatCodeBlock>
            ) : (
              <code className='px-1.5 py-0.5 rounded bg-muted font-mono text-[0.875em] text-foreground'>
                {children}
              </code>
            )
          },
          a({ href, children }) {
            if (href?.toLowerCase().startsWith('documents/')) {
              return <SourceLink href={href}>{children}</SourceLink>
            }

            return (
              <a
                href={href || '#'}
                target='_blank'
                rel='noreferrer'
                className='text-primary hover:underline underline-offset-4'
              >
                {children}
              </a>
            )
          },
          p: ({ children }) => <p className='mb-4 last:mb-0 leading-relaxed'>{children}</p>,
          h1: ({ children }) => <h1 className='text-xl font-bold mt-6 mb-3'>{children}</h1>,
          h2: ({ children }) => <h2 className='text-lg font-bold mt-5 mb-2'>{children}</h2>,
          h3: ({ children }) => <h3 className='text-base font-bold mt-4 mb-2'>{children}</h3>,
          ul: ({ children }) => <ul className='list-disc pl-5 mb-4 space-y-1'>{children}</ul>,
          ol: ({ children }) => <ol className='list-decimal pl-5 mb-4 space-y-1'>{children}</ol>,
          li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className='border-l-2 border-primary/50 pl-4 my-4 italic text-muted-foreground'>
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className='overflow-x-auto my-4 rounded-lg border'>
              <table className='w-full text-left text-sm border-collapse'>{children}</table>
            </div>
          ),
          th: ({ children }) => <th className='p-2 border-b bg-muted/50 font-semibold'>{children}</th>,
          td: ({ children }) => <td className='p-2 border-b'>{children}</td>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
