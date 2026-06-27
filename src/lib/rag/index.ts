import { AI } from '@/constants/ai'
import { google } from '@ai-sdk/google'

import { embed } from 'ai'
import { createClient } from '../supabase/server'
import { cookies } from 'next/headers'

export async function embedText(text: string) {
  const { embedding } = await embed({
    model: google.embeddingModel(AI.CHAT_EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: AI.CHAT_EMBEDDING_DIMENSIONS
      }
    }
  })

  return embedding
}

export function chunkText(text: string, size = 800) {
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

export const getRelevantChunks = async (
  embeddings: unknown,
  documentIds: string[] = [],
  topK = 5,
  threshold = 0.6,
  userId?: string,
  chatId?: string
) => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase.rpc('match_document_chunks', {
    query_embedding: embeddings,
    match_count: topK,
    match_threshold: threshold,
    p_user_id: userId, // Pass userId to the RPC for security
    p_chat_id: chatId || null,
    p_doc_ids: documentIds.includes('ALL') ? null : documentIds
  })

  let finalDocumentIds = documentIds

  if (documentIds.includes('ALL')) {
    if (chatId) {
      // Fetch all documents for this chat
      let docsQuery = supabase.from('documents').select('id').eq('chat_id', chatId)

      if (userId) {
        docsQuery = docsQuery.eq('user_id', userId)
      }

      const { data: chatDocs } = await docsQuery

      if (chatDocs && chatDocs.length > 0) {
        finalDocumentIds = chatDocs.map(doc => doc.id)
      } else {
        finalDocumentIds = ['00000000-0000-0000-0000-000000000000']
      }
    } else {
      // If no chatId (e.g. new chat), match nothing
      finalDocumentIds = ['00000000-0000-0000-0000-000000000000']
    }
  }

  if (finalDocumentIds.length === 0) {
    query = query.in('document_id', ['00000000-0000-0000-0000-000000000000'])
  } else {
    query = query.in('document_id', finalDocumentIds)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export function buildContextFromChunks(
  chunks: {
    content: string
    document_id: string
    similarity: number
    document_title?: string
  }[]
) {
  return chunks
    .map((chunk, index) => {
      return `
        [SOURCE_${index + 1}]
        FILE: ${chunk.document_title ?? 'Unknown'}
        DOCUMENT_ID: ${chunk.document_id}
        SIMILARITY: ${chunk.similarity}

        CONTENT:
        ${chunk.content}
        `
    })
    .join('\n\n---\n\n')
}

export const getSystemPrompt = () => {
  return `
    You are an internal developer assistant.

    Help developers understand and work with
    the codebase, APIs, infrastructure,
    documentation, and engineering workflows.

    Each retrieved chunk contains a DOCUMENT_ID field.

    When referencing retrieved knowledge, cite the
    source by copying the DOCUMENT_ID value exactly:

    [@source:DOCUMENT_ID]

    Example — if the chunk shows:
      DOCUMENT_ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

    Then cite it as:
    [@source:a1b2c3d4-e5f6-7890-abcd-ef1234567890]

    Rules:
    - Use the exact UUID from DOCUMENT_ID, nothing else.
    - Never use the source index number (SOURCE_1, SOURCE_2…).
    - Each citation is a separate bracket: [@source:uuid1] [@source:uuid2]
    - Only cite sources that were actually used.

    If information is inferred using general
    software engineering knowledge rather than
    directly found in the retrieved context,
    clearly mention:

    "Inference:" or
    "General recommendation:"

    Never pretend inferred knowledge came from
    the documents.

    Use the retrieved context as the primary
    source of truth.

    You may supplement missing details using
    general software engineering knowledge
    when helpful.

    You can:
    - explain code
    - suggest implementations
    - help debug
    - improve architecture
    - write examples
    - recommend best practices

    If something is inferred rather than directly
    documented, state that clearly.

    If retrieved context conflicts with general
    knowledge, prefer the retrieved context.

    Format responses using clean Markdown.

    Use from the following when appropriate:
    - headings
    - bullet points
    - numbered lists
    - tables when useful
    - fenced code blocks with language tags
    - short paragraphs
    - inline code formatting

    Keep responses practical, technical,
    and structured.`
}

export const getPrompt = (query: string, context: string) => {
  return `
    # RETRIEVED CONTEXT

    ${context}

    # USER QUESTION

    ${query}
    `
}
