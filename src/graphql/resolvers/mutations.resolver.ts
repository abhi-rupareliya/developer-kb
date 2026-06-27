import { PROCESSING_STATUS } from '@/constants/Uploads'
import {
  GraphQLContext,
  Document,
  CreateDocumentInput,
  CreateDocumentResponse,
  Chat,
  CreateChatInput,
  UpdateChatInput,
  CreateChatResponse,
  Message,
  CreateMessageInput,
  DeleteResponse
} from '@/types/graphql'

export const mutationResolvers = {
  Mutation: {
    createDocument: async (
      _: unknown,
      { input }: { input: CreateDocumentInput },
      { supabase, user }: GraphQLContext
    ): Promise<CreateDocumentResponse> => {
      if (!user) return { success: false, message: 'Unauthorized', document: null }

      if (input.chat_id) {
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .select('id')
          .eq('id', input.chat_id)
          .eq('user_id', user.id)
          .single()

        if (chatError || !chat) {
          return { success: false, message: 'Chat not found or access denied', document: null }
        }
      }

      const payload = {
        user_id: user.id,
        chat_id: input.chat_id ?? null,
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
        return { success: false, message: error.message, document: null }
      }

      return { success: true, message: 'Document created successfully', document: data as Document }
    },

    createChat: async (
      _: unknown,
      { input }: { input: CreateChatInput },
      { supabase, user }: GraphQLContext
    ): Promise<CreateChatResponse> => {
      if (!user) return { success: false, message: 'Unauthorized', chat: null }

      const { data, error } = await supabase
        .from('chats')
        .insert({ user_id: user.id, title: input.title ?? 'New Chat', metadata: input.metadata ?? {} })
        .select()
        .single()

      if (error) return { success: false, message: error.message, chat: null }

      return { success: true, message: 'Chat created successfully', chat: data as Chat }
    },

    updateChat: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateChatInput },
      { supabase, user }: GraphQLContext
    ): Promise<CreateChatResponse> => {
      if (!user) return { success: false, message: 'Unauthorized', chat: null }

      const payload: Partial<UpdateChatInput> = {}
      if (input.title !== undefined) payload.title = input.title
      if (input.metadata !== undefined) payload.metadata = input.metadata

      const { data, error } = await supabase
        .from('chats')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { success: false, message: error.message, chat: null }

      return { success: true, message: 'Chat updated successfully', chat: data as Chat }
    },

    deleteChat: async (
      _: unknown,
      { id }: { id: string },
      { supabase, user }: GraphQLContext
    ): Promise<DeleteResponse> => {
      if (!user) return { success: false, message: 'Unauthorized' }

      const { error } = await supabase.from('chats').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { success: false, message: error.message }

      return { success: true, message: 'Chat deleted successfully' }
    },

    createMessage: async (
      _: unknown,
      { input }: { input: CreateMessageInput },
      { supabase, user }: GraphQLContext
    ): Promise<Message> => {
      if (!user) throw new Error('Unauthorized')

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', input.chat_id)
        .eq('user_id', user.id)
        .single()

      if (chatError || !chat) throw new Error('Chat not found or access denied')

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

      if (error) throw new Error(error.message)

      return data as Message
    },

    deleteMessage: async (
      _: unknown,
      { id }: { id: string },
      { supabase, user }: GraphQLContext
    ): Promise<DeleteResponse> => {
      if (!user) throw new Error('Unauthorized')

      const { data: messageRow, error: fetchError } = await supabase
        .from('messages')
        .select('chat_id')
        .eq('id', id)
        .single()

      if (fetchError || !messageRow) throw new Error('Message not found')

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', messageRow.chat_id)
        .eq('user_id', user.id)
        .single()

      if (chatError || !chat) throw new Error('Unauthorized access to this message')

      const { error } = await supabase.from('messages').delete().eq('id', id)

      if (error) throw new Error(error.message)

      return { success: true, message: 'Message deleted successfully' }
    },

    deleteDocument: async (
      _: unknown,
      { id }: { id: string },
      { supabase, user }: GraphQLContext
    ): Promise<DeleteResponse> => {
      if (!user) return { success: false, message: 'Unauthorized' }

      const { error } = await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id)

      if (error) return { success: false, message: error.message }

      return { success: true, message: 'Document deleted successfully' }
    }
  }
}
