import type { Metadata } from 'next'
import './globals.css'
import { ApolloProviderWrapper } from '@/lib/apollo/provider'
import { ChatProvider } from '@/contexts/chat-context'
import { Geist } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Developer KB Chat',
  description: 'AI-powered chat with document knowledge base'
}

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode
  modal?: React.ReactNode
}>) {
  return (
    <html lang='en' className={cn('font-sans', geist.variable)}>
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <ApolloProviderWrapper>
              <ChatProvider>
                {children}
                {modal}
              </ChatProvider>
            </ApolloProviderWrapper>
          </TooltipProvider>
          <Toaster richColors position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  )
}
