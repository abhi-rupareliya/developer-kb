import { gql } from 'graphql-tag'

export const chatTypeDefs = gql`
  type Chat {
    id: ID!
    user_id: ID!
    title: String
    metadata: JSON
    created_at: String!
    updated_at: String!
  }

  type CreateChatResponse {
    success: Boolean!
    message: String!
    chat: Chat
  }

  input CreateChatInput {
    title: String
    metadata: JSON
  }

  input UpdateChatInput {
    title: String
    metadata: JSON
  }
`
