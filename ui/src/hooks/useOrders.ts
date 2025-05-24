import type { OrdersQueryResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";

const fieldMapping: Record<string, string> = {
  orderID: "orderID",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  status: "status",
  paymentMethod: "paymentMethod",
  price: "price",
  tax: "tax",
  deliveryFee: "deliveryFee",
  orderedAt: "orderedAt",
  paidAt: "paidAt",
  inTransitAt: "inTransitAt",
  deliveredAt: "deliveredAt",
  make: "make",
  carModel: "carModel",
  year: "year",
  color: "color",
  vin: "vin",
  address: "address",
  city: "city",
  state: "state",
  zip: "zip",
};

function buildOrdersQuery(visibleFields: string[]) {
  const graphqlFields = visibleFields
    .filter((field) => field !== "actions" && fieldMapping[field])
    .map((field) => fieldMapping[field]);

  const allFields = [...new Set([...graphqlFields])];

  const fieldsString = allFields.join("\n          ");

  return gql`
    query Orders($first: Int, $after: String, $last: Int, $search: String, $searchFields: [String!]) {
      orders(first: $first, after: $after, last: $last, search: $search, searchFields: $searchFields) {
        edges {
          cursor
          node {
            ${fieldsString}
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
      }
    }
  `;
}

export function useOrders(
  first = 10,
  after?: string,
  visibleFields: string[] = [
    "orderID",
    "firstName",
    "lastName",
    "email",
    "status",
    "price",
    "orderedAt",
  ],
  search?: string,
  searchFields?: string[],
  last?: number
) {
  return useQuery({
    queryKey: [
      "orders",
      first,
      after,
      last,
      visibleFields.sort(),
      search,
      searchFields?.sort(),
    ],
    queryFn: async () => {
      const query = buildOrdersQuery(visibleFields);
      const res: OrdersQueryResponse = await graphqlClient.request(query, {
        first: last ? undefined : first,
        after,
        last,
        search,
        searchFields,
      });
      return res.orders;
    },
  });
}
