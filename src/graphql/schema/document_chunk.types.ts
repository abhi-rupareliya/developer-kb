import gql from 'graphql-tag'

export const documentChunkTypeDefs = gql`
  scalar JSON

  type Query {
    queryDocuments(query: String!): [DocumentChunk!]!
  }

  type DocumentChunk {
    document_id: String!
    content: ID!
    similarity: Float!
  }
`
