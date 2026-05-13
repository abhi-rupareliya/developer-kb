import { gql } from 'graphql-tag'

export const messageTypeDefs = gql`
  scalar JSON

  type Message {
    id: ID!
    chat_id: String!
    role: String!
    content: String!
    metadata: JSON
    created_at: String!
  }

  type PaginatedMessages {
    messages: [Message!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasMore: Boolean!
  }

  input CreateMessageInput {
    chat_id: String!
    role: String!
    content: String!
    metadata: JSON
  }

  type DeleteMessageResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    messages(chatId: ID!, page: Int = 1, limit: Int = 20): PaginatedMessages!
  }

  type Mutation {
    createMessage(input: CreateMessageInput!): Message!
    deleteMessage(id: ID!): DeleteMessageResponse!
  }
`
