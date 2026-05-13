import gql from 'graphql-tag'

export const queryTypeDefs = gql`
  type Query {
    documents: [Document!]!
    document(id: ID!): Document
    documentStatus(id: ID!): String!
    queryDocuments(query: String!): [DocumentChunk!]!
  }
`
