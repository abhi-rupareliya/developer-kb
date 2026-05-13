import { gql } from 'graphql-tag'

export const chatTypeDefs = gql`
  scalar JSON

  type Chat {
    id: ID!
    user_id: String!
    title: String
    metadata: JSON
    created_at: String!
    updated_at: String!
  }

  input CreateChatInput {
    title: String
    metadata: JSON
  }

  type CreateChatResponse {
    success: Boolean!
    message: String!
    chat: Chat
  }

  input UpdateChatInput {
    title: String
    metadata: JSON
  }

  type Query {
    chats: [Chat!]!
    chat(id: ID!): Chat
  }

  type Mutation {
    createChat(input: CreateChatInput!): CreateChatResponse!
    updateChat(id: ID!, input: UpdateChatInput!): CreateChatResponse!
    deleteChat(id: ID!): DeleteResponse!
  }
`
