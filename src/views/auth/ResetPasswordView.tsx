'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/actions/auth'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ResetPasswordView() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <AuthFormContainer title='Reset password' description='Enter your new password below'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='password'>New Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            className='bg-background/50'
          />
        </div>
        <Button type='submit' className='w-full font-semibold' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Update Password
        </Button>
      </form>
    </AuthFormContainer>
  )
}
