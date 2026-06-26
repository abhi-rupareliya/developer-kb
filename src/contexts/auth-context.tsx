'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  session: Session | null
  user: User | null
  userId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      const {
        data: { session: nextSession }
      } = await supabase.auth.getSession()

      if (!isMounted) return

      setSession(nextSession)
      setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return

      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    userId: session?.user.id ?? null,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
