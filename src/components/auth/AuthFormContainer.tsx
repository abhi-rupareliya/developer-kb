import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BookOpen } from 'lucide-react'

interface AuthFormContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthFormContainer({ title, description, children, className }: AuthFormContainerProps) {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden'>
      {/* Ambient glow orbs */}
      <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-1/4 -left-1/4 h-2/3 w-2/3 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute -bottom-1/4 -right-1/4 h-2/3 w-2/3 rounded-full bg-primary/5 blur-3xl' />
      </div>

      <div className='relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500'>
        {/* Brand mark */}
        <div className='flex flex-col items-center mb-8 gap-2'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg'>
            <BookOpen className='h-5 w-5 text-primary-foreground' />
          </div>
          <span className='text-xs font-semibold tracking-widest text-muted-foreground uppercase'>Developer KB</span>
        </div>

        <Card className={cn('w-full border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl', className)}>
          <CardHeader className='space-y-1.5 text-center pb-5 pt-8 px-8'>
            <CardTitle className='text-2xl font-bold tracking-tight'>{title}</CardTitle>
            {description && (
              <CardDescription className='text-sm leading-relaxed'>{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className='px-8 pb-8'>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
