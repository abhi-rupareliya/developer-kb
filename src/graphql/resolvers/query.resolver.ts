import { embedText } from '@/lib/rag'
import { GraphQLContext, Document, DocumentChunk, Chat, Message, PaginatedMessages } from '@/types/graphql'

export const queryResolvers = {
  Query: {
    documents: async (
      _: unknown,
      { chatId }: { chatId?: string },
      { supabase, user }: GraphQLContext
    ): Promise<Document[]> => {
      if (!user) return []
      let query = supabase.from('documents').select('*').eq('user_id', user.id)

      if (chatId) {
        query = query.eq('chat_id', chatId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },

    document: async (
      _: unknown,
      { id }: { id: string },
      { supabase, user }: GraphQLContext
    ): Promise<Document | null> => {
      if (!user) return null
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).eq('user_id', user.id).single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }

        throw new Error(error.message)
      }

      return data
    },

    documentStatus: async (_: unknown, { id }: { id: string }, { supabase, user }: GraphQLContext): Promise<string> => {
      if (!user) return 'unauthorized'
      const { data, error } = await supabase
        .from('documents')
        .select('processing_status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return 'not_found'
        }
        throw new Error(error.message)
      }

      return data?.processing_status || 'unknown'
    },

    queryDocuments: async (
      _: unknown,
      { query }: { query: string },
      { supabase, user }: GraphQLContext
    ): Promise<DocumentChunk[]> => {
      if (!user) return []
      const threshold = 0.6
      const topK = 10

      if (!query || typeof query !== 'string') {
        throw new Error('query must be a string')
      }

      const embedding = await embedText(query)

      const { data, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: topK,
        p_user_id: user.id
      })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    },

    chats: async (_: unknown, __: unknown, { supabase, user }: GraphQLContext): Promise<Chat[]> => {
      if (!user) return []
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },

    chat: async (_: unknown, { id }: { id: string }, { supabase, user }: GraphQLContext): Promise<Chat | null> => {
      if (!user) return null
      const { data, error } = await supabase.from('chats').select('*').eq('id', id).eq('user_id', user.id).single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(error.message)
      }

      return data
    },

    messages: async (
      _: unknown,
      { chatId, page = 1, limit = 20 }: { chatId: string; page?: number; limit?: number },
      { supabase, user }: GraphQLContext
    ): Promise<PaginatedMessages> => {
      if (!user) throw new Error('Unauthorized')

      // Verify chat ownership
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single()

      if (chatError || !chat) {
        throw new Error('Chat not found or access denied')
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('messages')
        .select('*', {
          count: 'exact'
        })
        .eq('chat_id', chatId)
        .order('created_at', {
          ascending: false
        })
        .range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      const total = count || 0

      const totalPages = Math.ceil(total / limit)

      const chunkMessages = data ? data.reverse() : []

      return {
        messages: chunkMessages,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    }
  }
}
