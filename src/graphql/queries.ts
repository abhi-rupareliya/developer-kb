import { gql } from '@apollo/client/core'

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      title
      created_at
      updated_at
    }
  }
`

export const GET_CHAT = gql`
  query GetChat($id: ID!) {
    chat(id: $id) {
      id
      title
      created_at
      updated_at
    }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!, $page: Int, $limit: Int) {
    messages(chatId: $chatId, page: $page, limit: $limit) {
      messages {
        id
        chat_id
        role
        content
        created_at
      }
      total
      page
      limit
      totalPages
      hasMore
    }
  }
`

export const GET_DOCUMENTS = gql`
  query GetDocuments($chatId: ID) {
    documents(chatId: $chatId) {
      id
      title
      original_file_name
      mime_type
      created_at
      processing_status
    }
  }
`
