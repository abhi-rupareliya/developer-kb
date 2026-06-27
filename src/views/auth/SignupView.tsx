'use client'

import React, { useState, useTransition } from 'react'
import { AuthFormContainer } from '@/components/auth/AuthFormContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

function getPasswordStrength(password: string): { score: number; label: string; colorClass: string } {
  if (!password) return { score: 0, label: '', colorClass: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { label: 'Weak', colorClass: 'bg-destructive' },
    { label: 'Fair', colorClass: 'bg-orange-500' },
    { label: 'Good', colorClass: 'bg-yellow-500' },
    { label: 'Strong', colorClass: 'bg-green-500' },
    { label: 'Very strong', colorClass: 'bg-emerald-500' },
  ]
  return { score, ...levels[score] }
}

export function SignupView() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  const strength = getPasswordStrength(password)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

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
    <AuthFormContainer title='Create an account' description='Join and start building your knowledge base'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Display Name */}
        <div className='space-y-2'>
          <Label htmlFor='displayName' className='text-sm font-medium'>
            Display Name
          </Label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              id='displayName'
              name='displayName'
              type='text'
              placeholder='John Doe'
              required
              className='pl-9 bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors'
            />
          </div>
        </div>

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
          <Label htmlFor='password' className='text-sm font-medium'>
            Password
          </Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete='new-password'
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          {/* Strength meter */}
          {password.length > 0 && (
            <div className='space-y-1'>
              <div className='flex gap-1'>
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < strength.score ? strength.colorClass : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                Strength:{' '}
                <span className='font-medium text-foreground'>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-sm font-medium'>
            Confirm Password
          </Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete='new-password'
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
                setPasswordMismatch(false)
              }}
              className={`pl-9 pr-16 bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-colors ${
                passwordMismatch ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''
              }`}
            />
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className='absolute right-9 top-1/2 -translate-y-1/2'>
                {passwordsMatch ? (
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                ) : (
                  <XCircle className='h-4 w-4 text-destructive' />
                )}
              </div>
            )}
            <button
              type='button'
              onClick={() => setShowConfirm(v => !v)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button type='submit' className='w-full font-semibold mt-1' disabled={isPending}>
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Create Account
        </Button>
      </form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-border/40' />
        </div>
        <div className='relative flex justify-center'>
          <span className='px-3 bg-card text-xs text-muted-foreground/60'>Already a member?</span>
        </div>
      </div>

      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link href='/login' className='font-semibold text-foreground hover:underline underline-offset-4 transition-colors'>
          Sign in
        </Link>
      </p>
    </AuthFormContainer>
  )
}
