'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function LoginView() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <AuthFormContainer title='Welcome back' description='Enter your credentials to access your workspace'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='name@example.com'
            required
            autoComplete='email'
            className='bg-background/50'
          />
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href='/forgot-password'
              className='text-xs text-muted-foreground hover:text-primary transition-colors'
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='current-password'
            className='bg-background/50'
          />
        </div>
        <Button type='submit' className='w-full font-semibold' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Sign In
        </Button>
      </form>
      <div className='mt-6 text-center text-sm'>
        <span className='text-muted-foreground'>Don&apos;t have an account? </span>
        <Link href='/signup' className='font-medium text-primary hover:underline underline-offset-4'>
          Sign up
        </Link>
      </div>
    </AuthFormContainer>
  )
}
