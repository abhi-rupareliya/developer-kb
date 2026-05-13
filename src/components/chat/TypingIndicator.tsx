'use client'

import { cn } from '@/lib/utils'

export function TypingIndicator() {
  return (
    <div className='flex items-center gap-1.5 py-1 px-1'>
      {[0, 1, 2].map(dot => (
        <div
          key={dot}
          className={cn('w-1.5 h-1.5 rounded-full bg-muted-foreground/50', 'animate-bounce')}
          style={{ animationDelay: `${dot * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}
