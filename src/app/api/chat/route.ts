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

    // 1. Generate query embeddings
    const embeddings = await embedText(question)

    // 2. Retrieve relevant chunks
    const relevantChunks = await getRelevantChunks(embeddings, documentIds)

    // 3. Build structured context
    const context = buildContextFromChunks(relevantChunks)

    // 4. Build prompts
    const systemPrompt = getSystemPrompt()
    const userPrompt = getPrompt(question, context)

    // 5. Stream AI response
    const result = streamText({
      model: google(AI.CHAT_GENERATION_MODEL),
      system: systemPrompt,
      prompt: userPrompt
    })

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
