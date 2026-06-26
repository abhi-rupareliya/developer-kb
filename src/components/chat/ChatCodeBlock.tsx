'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ChatCodeBlockProps = {
  language?: string
  children: string
}

// Header copy icon with tooltip
export const renderCodeHeaderIcon = (copied: boolean) => {
  if (copied) {
    return <Check className='h-3.5 w-3.5 text-green-500' />
  } else {
    return <Copy className='h-3.5 w-3.5' />
  }
}

export function ChatCodeBlock({ language, children }: ChatCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='relative my-4 w-full group overflow-hidden rounded-xl border border-border/50 shadow-sm'>
      <div className='flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-400 border-b border-zinc-800'>
        <span className='text-xs font-mono lowercase'>{language || 'code'}</span>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              onClick={handleCopy}
            >
              {renderCodeHeaderIcon(copied)}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left' className='bg-zinc-800 border-zinc-700 text-zinc-100'>
            {copied ? 'Copied!' : 'Copy code'}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='bg-[#1e1e1e] overflow-x-auto custom-scrollbar'>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag='div'
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: 1.6
          }}
        >
          {children.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
