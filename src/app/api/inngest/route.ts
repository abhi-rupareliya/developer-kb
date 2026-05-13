import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { processDocument } from '@/ingest/process-document'
export const runtime = 'nodejs'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processDocument]
})
