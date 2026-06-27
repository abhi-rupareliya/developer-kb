import { gql } from 'graphql-tag'

export const mutationTypeDefs = gql`
  input CreateDocumentInput {
    chat_id: ID
    title: String!
    original_file_name: String!
    storage_bucket: String
    storage_path: String!
    public_url: String
    mime_type: String
    file_size: Float
    file_hash: String
    upload_status: String
    processing_status: String
    extracted_text: String
    metadata: JSON
  }

  type CreateDocumentResponse {
    success: Boolean!
    message: String!
    document: Document
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createDocument(input: CreateDocumentInput!): CreateDocumentResponse!
    deleteDocument(id: ID!): DeleteResponse!
    createChat(input: CreateChatInput!): CreateChatResponse!
    updateChat(id: ID!, input: UpdateChatInput!): CreateChatResponse!
    deleteChat(id: ID!): DeleteResponse!
    createMessage(input: CreateMessageInput!): Message!
    deleteMessage(id: ID!): DeleteResponse!
  }
`
