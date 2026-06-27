import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { gql } from 'graphql-tag'
import GraphQLJSON from 'graphql-type-json'

import { documentTypeDefs } from './schema/document.types'
import { documentChunkTypeDefs } from './schema/document_chunk.types'
import { chatTypeDefs } from './schema/chat.types'
import { messageTypeDefs } from './schema/message.types'
import { queryTypeDefs } from './schema/queries'
import { mutationTypeDefs } from './schema/mutations'

import { queryResolvers } from './resolvers/query.resolver'
import { mutationResolvers } from './resolvers/mutations.resolver'

const scalarTypeDefs = gql`
  scalar JSON
`

export const typeDefs = mergeTypeDefs([
  scalarTypeDefs,
  documentTypeDefs,
  documentChunkTypeDefs,
  chatTypeDefs,
  messageTypeDefs,
  queryTypeDefs,
  mutationTypeDefs
])

export const resolvers = mergeResolvers([
  { JSON: GraphQLJSON },
  queryResolvers,
  mutationResolvers
])
