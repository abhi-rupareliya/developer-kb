'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

export function ForgotPasswordView() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <AuthFormContainer title='Forgot password?' description='Enter your email and we will send you a reset link'>
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
        <Button type='submit' className='w-full font-semibold' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Send Reset Link
        </Button>
      </form>
      <div className='mt-6 text-center text-sm'>
        <Link
          href='/login'
          className='inline-flex items-center text-muted-foreground hover:text-primary transition-colors'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to login
        </Link>
      </div>
    </AuthFormContainer>
  )
}
