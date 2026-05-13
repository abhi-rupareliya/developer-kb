import { embedText } from "@/lib/rag";
import {
  GraphQLContext,
  Document,
  DocumentChunk,
  Chat,
  Message,
} from "@/types/graphql";

interface DocumentArgs {
  id: string;
}

export const queryResolvers = {
  Query: {
    documents: async (
      _: unknown,
      __: unknown,
      { supabase }: GraphQLContext,
    ): Promise<Document[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    document: async (
      _: unknown,
      { id }: DocumentArgs,
      { supabase }: GraphQLContext,
    ): Promise<Document | null> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }

        throw new Error(error.message);
      }

      return data;
    },

    documentStatus: async (
      _: unknown,
      { id }: DocumentArgs,
      { supabase }: GraphQLContext,
    ): Promise<string> => {
      const { data, error } = await supabase
        .from("documents")
        .select("processing_status")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return "not_found";
        }
        throw new Error(error.message);
      }

      return data?.processing_status || "unknown";
    },

    queryDocuments: async (
      _: unknown,
      { query }: { query: string },
      { supabase }: GraphQLContext,
    ): Promise<DocumentChunk[]> => {
      const threshold = 0.6;
      const topK = 10;

      if (!query || typeof query !== "string") {
        throw new Error("query must be a string");
      }

      // 1. Embed query
      const embedding = await embedText(query);

      // 2. Query  vector DB
      const { data, error } = await supabase.rpc("match_document_chunks", {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: topK,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },

    chats: async (
      _: unknown,
      __: unknown,
      { supabase }: GraphQLContext,
    ): Promise<Chat[]> => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    chat: async (
      _: unknown,
      { id }: { id: string },
      { supabase }: GraphQLContext,
    ): Promise<Chat | null> => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    },

    messages: async (
      _: unknown,
      {
        chatId,
        page = 1,
        limit = 20,
      }: {
        chatId: string;
        page?: number;
        limit?: number;
      },
      { supabase }: GraphQLContext,
    ): Promise<{
      messages: Message[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    }> => {
      const from = (page - 1) * limit;

      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("messages")
        .select("*", {
          count: "exact",
        })
        .eq("chat_id", chatId)
        .order("created_at", {
          ascending: true,
        })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      const total = count || 0;

      const totalPages = Math.ceil(total / limit);

      return {
        messages: data || [],
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    },
  },
};
