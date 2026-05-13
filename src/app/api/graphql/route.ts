// app/api/graphql/route.ts

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

import { typeDefs } from "@/graphql";
import { resolvers } from "@/graphql";
import { GraphQLContext } from "@/types/graphql";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  csrfPrevention: false,
  introspection: true,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async () => {
      const cookieStore = await cookies();
      const supabaseClient = createClient(cookieStore);
      return {
        supabase: supabaseClient,
      };
    },
  },
);

export async function POST(request: NextRequest) {
  return handler(request);
}
