import { GraphQLClient } from "graphql-request";

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? "http://localhost:4447/graphql"
);
