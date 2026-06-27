'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function LoginView() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

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
    <AuthFormContainer title='Welcome back' description='Sign in to continue to your workspace'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Email */}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-medium'>
            Email
          </Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='name@example.com'
              required
              autoComplete='email'
              className='pl-9 bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors'
            />
          </div>
        </div>

        {/* Password */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password' className='text-sm font-medium'>
              Password
            </Label>
            <Link
              href='/forgot-password'
              className='text-xs text-muted-foreground hover:text-primary transition-colors'
            >
              Forgot password?
            </Link>
          </div>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete='current-password'
              className='pl-9 pr-9 bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors'
            />
            <button
              type='button'
              onClick={() => setShowPassword(v => !v)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button type='submit' className='w-full font-semibold mt-1' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Sign In
        </Button>
      </form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-border/40' />
        </div>
        <div className='relative flex justify-center'>
          <span className='px-3 bg-card text-xs text-muted-foreground/60'>New here?</span>
        </div>
      </div>

      <p className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link href='/signup' className='font-semibold text-foreground hover:underline underline-offset-4 transition-colors'>
          Create one
        </Link>
      </p>
    </AuthFormContainer>
  )
}
