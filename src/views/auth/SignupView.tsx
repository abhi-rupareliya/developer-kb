'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function SignupView() {
  const [isPending, startTransition] = useTransition()
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      toast.error('Passwords do not match')
      return
    }

    setPasswordMismatch(false)

    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <AuthFormContainer title='Create an account' description='Enter your details to get started'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='displayName'>Display Name</Label>
          <Input
            id='displayName'
            name='displayName'
            type='text'
            placeholder='John Doe'
            required
            className='bg-background/50'
          />
        </div>
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
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            className='bg-background/50'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            required
            autoComplete='new-password'
            className={`bg-background/50 ${passwordMismatch ? 'border-red-500' : ''}`}
          />
        </div>
        <Button type='submit' className='w-full font-semibold' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Create Account
        </Button>
      </form>
      <div className='mt-6 text-center text-sm'>
        <span className='text-muted-foreground'>Already have an account? </span>
        <Link href='/login' className='font-medium text-primary hover:underline underline-offset-4'>
          Sign in
        </Link>
      </div>
    </AuthFormContainer>
  )
}
