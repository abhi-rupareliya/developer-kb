import { mergeTypeDefs } from "@graphql-tools/merge";
import { mergeResolvers } from "@graphql-tools/merge";
import GraphQLJSON from "graphql-type-json";

import { documentTypeDefs } from "./schema/document.types";
import { documentChunkTypeDefs } from "./schema/document_chunk.types";
import { queryTypeDefs } from "./schema/queries";
import { mutationTypeDefs } from "./schema/mutations";

import { queryResolvers } from "./resolvers/query.resolver";
import { mutationResolvers } from "./resolvers/mutations.resolver";
import { chatTypeDefs } from "./schema/chat.types";
import { messageTypeDefs } from "./schema/message.types";

export const typeDefs = mergeTypeDefs([
  documentTypeDefs,
  documentChunkTypeDefs,
  queryTypeDefs,
  mutationTypeDefs,
  chatTypeDefs,
  messageTypeDefs,
]);

export const resolvers = mergeResolvers([
  {
    JSON: GraphQLJSON,
  },

  queryResolvers,
  mutationResolvers,
]);
