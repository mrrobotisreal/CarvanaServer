import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";

const ORDERS_QUERY = gql/* GraphQL */ `
  query Orders($first: Int!, $after: String) {
    orders(first: $first, after: $after) {
      edges {
        cursor
        node {
          orderID
          firstName
          lastName
          status
          paymentMethod
          price
          orderedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export function useOrders(first = 10, after?: string) {
  return useQuery({
    queryKey: ["orders", first, after],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await graphqlClient.request(ORDERS_QUERY, {
        first,
        after,
      });
      return res.orders;
    },
  });
}
