import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type Order {
    id: ID!
    orderID: Int!
    firstName: String!
    lastName: String!
    email: String!
    status: String!
    paymentMethod: String!
    price: Float!
    tax: Float!
    deliveryFee: Float!
    orderedAt: Date!
    paidAt: Date
    inTransitAt: Date
    deliveredAt: Date
    make: String!
    carModel: String!
    year: Int!
    color: String!
    vin: String!
    address: String!
    city: String!
    state: String!
    zip: Int!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    orders(first: Int = 10, after: String, search: String): OrderConnection!
  }
`;
