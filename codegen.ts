import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,

  schema: "http://localhost:3000/api/graphql",

  documents: ["src/graphql/operations/**/*.graphql"],

  generates: {
    "src/graphql/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-resolvers",
        "typed-document-node",
      ],

      config: {
        enumsAsTypes: true,
        avoidOptionals: true,

        scalars: {
          JSON: "Record<string, unknown>",
          DateTime: "string",
        },
      },
    },
  },
};

export default config;
