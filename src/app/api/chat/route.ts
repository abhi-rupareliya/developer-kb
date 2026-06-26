import { NextRequest } from 'next/server'

import { buildContextFromChunks, embedText, getPrompt, getRelevantChunks, getSystemPrompt } from '@/lib/rag'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { AI } from '@/constants/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const question = body.question?.trim()
    const documentIds = body.documentIds || []
    const chatId = body.chatId || null

    if (!question) {
      return Response.json(
        {
          success: false,
          error: 'Question is required'
        },
        {
          status: 400
        }
      )
    }

    // 1. Authenticate user
    const { cookies } = await import('next/headers')
    const { createClient } = await import('@/lib/supabase/server')
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Generate query embeddings
    const embeddings = await embedText(question)

    // 3. Retrieve relevant chunks (scoped to user and chat)
    const relevantChunks = await getRelevantChunks(embeddings, documentIds, 5, 0.6, user.id, chatId)

    // 3. Build structured context
    const context = buildContextFromChunks(relevantChunks)

    // 4. Build prompts
    const systemPrompt = getSystemPrompt()
    const userPrompt = getPrompt(question, context)

    const history = chatId ? await fetchChatHistory(chatId) : []

    // 5. Stream AI response
    const result = streamText({
      model: google(AI.CHAT_GENERATION_MODEL),
      system: systemPrompt,
      messages: [...history, { role: 'user', content: userPrompt }]
    })

    async function fetchChatHistory(id: string) {
      const { data, error } = await supabase
        .from('messages')
        .select('role, content')
        .eq('chat_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw new Error(error.message)
      }

      return (data || []).reverse()
    }

    // 6. Return streaming response
    return result.toTextStreamResponse()
  } catch (error: unknown) {
    console.error(error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      {
        status: 500
      }
    )
  }
}
