import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthFormContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthFormContainer({ title, description, children, className }: AuthFormContainerProps) {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-background/50 p-4'>
      <div className='absolute inset-0 z-[-1] overflow-hidden'>
        <div className='absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]' />
        <div className='absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]' />
      </div>
      <Card
        className={cn(
          'w-full max-w-md border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500',
          className
        )}
      >
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>{title}</CardTitle>
          {description && <CardDescription className='text-muted-foreground'>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
