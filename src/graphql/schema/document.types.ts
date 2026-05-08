import gql from "graphql-tag";

export const documentTypeDefs = gql`
  scalar JSON

  type Document {
    id: ID!
    user_id: ID!
    title: String!
    original_file_name: String!
    storage_bucket: String!
    storage_path: String!
    public_url: String
    mime_type: String
    file_size: Float
    file_hash: String
    upload_status: String!
    processing_status: String!
    extracted_text: String
    metadata: JSON!
    created_at: String!
    updated_at: String!
  }

  type Query {
    documents: [Document!]!
    document(id: ID!): Document
    documentStatus(id: ID!): String!
  }
`;
