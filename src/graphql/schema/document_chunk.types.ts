import { gql } from 'graphql-tag'

export const documentChunkTypeDefs = gql`
  type DocumentChunk {
    document_id: ID!
    content: String!
    similarity: Float!
  }
`
