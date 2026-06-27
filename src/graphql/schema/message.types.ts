import { gql } from 'graphql-tag'

export const messageTypeDefs = gql`
  type Message {
    id: ID!
    chat_id: ID!
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
    chat_id: ID!
    role: String!
    content: String!
    metadata: JSON
  }
`
