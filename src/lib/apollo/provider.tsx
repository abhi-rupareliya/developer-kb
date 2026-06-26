'use client'

import { ApolloProvider } from '@apollo/client/react'
import { useMemo } from 'react'

import { ReactNode } from 'react'
import { createApolloClient } from './client'
import { useAuth } from '@/contexts/auth-context'

interface ApolloProviderWrapperProps {
  children: ReactNode
}

export function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  const { userId } = useAuth()
  const apolloClient = useMemo(() => createApolloClient(), [])

  return (
    <ApolloProvider client={apolloClient} key={userId ?? 'anonymous'}>
      {children}
    </ApolloProvider>
  )
}
