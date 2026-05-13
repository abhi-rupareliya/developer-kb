import { PROCESSING_STATUS } from '@/constants/Uploads'
import { CreateDocumentInput, GraphQLContext, Document, CreateChatInput, CreateChatResponse } from '@/types/graphql'

interface CreateDocumentArgs {
  input: CreateDocumentInput
}

interface CreateDocumentResponse {
  success: boolean
  message: string
  document: Document | null
}

export const mutationResolvers = {
  Mutation: {
    createDocument: async (
      _: unknown,
      { input }: CreateDocumentArgs,
      { supabase }: GraphQLContext
    ): Promise<CreateDocumentResponse> => {
      const payload = {
        user_id: '03612923-6932-44f0-ad47-5097c604426b', // Replace with actual user ID from auth context
        title: input.title,
        original_file_name: input.original_file_name,
        storage_bucket: input.storage_bucket ?? 'documents',
        storage_path: input.storage_path,
        public_url: input.public_url ?? null,
        mime_type: input.mime_type ?? null,
        file_size: input.file_size ?? null,
        file_hash: input.file_hash ?? null,
        upload_status: input.upload_status ?? 'uploaded',
        processing_status: input.processing_status ?? PROCESSING_STATUS.PENDING,
        extracted_text: input.extracted_text ?? null,
        metadata: input.metadata ?? {}
      }

      const { data, error } = await supabase.from('documents').insert(payload).select().single()

      if (error) {
        console.log('error: ', error)
        return {
          success: false,
          message: error.message,
          document: null
        }
      }

      return {
        success: true,
        message: 'Document created successfully',
        document: data
      }
    },

    createChat: async (
      _: unknown,
      { input }: { input: CreateChatInput },
      { supabase }: GraphQLContext
    ): Promise<CreateChatResponse> => {
      const payload = {
        user_id: '03612923-6932-44f0-ad47-5097c604426b', // Replace with actual user ID from auth context
        title: input.title ?? 'New Chat',
        metadata: input.metadata ?? {}
      }

      const { data, error } = await supabase.from('chats').insert(payload).select().single()

      if (error) {
        return {
          success: false,
          message: error.message,
          chat: null
        }
      }

      return {
        success: true,
        message: 'Chat created successfully',
        chat: data
      }
    },

    updateChat: async (
      _: unknown,
      { id, input }: { id: string; input: CreateChatInput },
      { supabase }: GraphQLContext
    ): Promise<CreateChatResponse> => {
      const payload = {
        title: input.title,
        metadata: input.metadata
      }

      for (const key in payload) {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload]
        }
      }

      const { data, error } = await supabase.from('chats').update(payload).eq('id', id).select().single()

      if (error) {
        return {
          success: false,
          message: error.message,
          chat: null
        }
      }

      return {
        success: true,
        message: 'Chat updated successfully',
        chat: data
      }
    },

    deleteChat: async (
      _: unknown,
      { id }: { id: string },
      { supabase }: GraphQLContext
    ): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('chats').delete().eq('id', id)

      if (error) {
        console.log('error: ', error)
        return {
          success: false,
          message: error.message
        }
      }

      return {
        success: true,
        message: 'Chat deleted successfully'
      }
    },

    createMessage: async (
      _: unknown,
      {
        input
      }: {
        input: {
          chat_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Record<string, unknown>
        }
      },
      { supabase }: GraphQLContext
    ) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: input.chat_id,
          role: input.role,
          content: input.content,
          metadata: input.metadata ?? {}
        })
        .select('*')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },

    deleteMessage: async (
      _: unknown,
      {
        id
      }: {
        id: string
      },
      { supabase }: GraphQLContext
    ) => {
      const { data, error } = await supabase.from('messages').delete().eq('id', id).select('*').single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        message: 'Message deleted successfully',
        messageData: data
      }
    },

    deleteDocument: async (
      _: unknown,
      { id }: { id: string },
      { supabase }: GraphQLContext
    ): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('documents').delete().eq('id', id)

      if (error) {
        console.log('error: ', error)
        return {
          success: false,
          message: error.message
        }
      }

      return {
        success: true,
        message: 'Document deleted successfully'
      }
    }
  }
}
