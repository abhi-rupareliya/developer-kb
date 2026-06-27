import { gql } from 'graphql-tag'

export const queryTypeDefs = gql`
  type Query {
    documents(chatId: ID): [Document!]!
    document(id: ID!): Document
    documentStatus(id: ID!): String!
    queryDocuments(query: String!): [DocumentChunk!]!
    chats: [Chat!]!
    chat(id: ID!): Chat
    messages(chatId: ID!, page: Int = 1, limit: Int = 20): PaginatedMessages!
  }
`
