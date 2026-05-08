import type { SupabaseClient } from "@supabase/supabase-js";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  original_file_name: string;
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  file_hash: string | null;
  upload_status: string;
  processing_status: string;
  extracted_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title: string;
  original_file_name: string;
  storage_bucket?: string;
  storage_path: string;
  public_url?: string;
  mime_type?: string;
  file_size?: number;
  file_hash?: string;
  upload_status?: string;
  processing_status?: string;
  extracted_text?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphQLContext {
  supabase: SupabaseClient;
}

export interface DocumentChunk {
  document_id: string;
  content: string;
  similarity: number;
}

export type ChatMetadata = Record<string, unknown>;

export interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  metadata: ChatMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface CreateChatInput {
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateChatResponse {
  success: boolean;
  message: string;
  chat: Chat | null;
}

export interface UpdateChatInput {
  title?: string;
  metadata?: Record<string, unknown>;
}

export type MessageMetadata = Record<string, unknown>;

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  metadata: MessageMetadata | null;
  created_at: string;
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateMessageInput {
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageResponse {
  success: boolean;
  message: string;
  createdMessage: Message | null;
}

