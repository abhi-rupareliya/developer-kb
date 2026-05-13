import { gql } from '@apollo/client/core'

export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      success
      message
      chat {
        id
        title
        created_at
      }
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      chat_id
      role
      content
      created_at
    }
  }
`

export const DELETE_CHAT = gql`
  mutation DeleteChat($id: ID!) {
    deleteChat(id: $id) {
      success
      message
    }
  }
`

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      success
      message
    }
  }
`
