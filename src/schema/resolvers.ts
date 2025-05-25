import { Order } from '../models/Order';
import { toCursor, fromCursor } from "../utils/encodeCursor";
import { analyticsResolvers } from "./analyticsResolvers";
import { GraphQLScalarType, Kind } from "graphql";

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "JSON custom scalar type",
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

const ordersResolvers = {
  Query: {
    orders: async (_: any, { first, page, search, searchFields }: any) => {
      const filter: any = {};

      if (search) {
        if (searchFields && searchFields.length > 0) {
          const searchConditions = searchFields.map((field: string) => ({
            [field]: { $regex: search, $options: "i" },
          }));
          filter.$or = searchConditions;
        } else {
          const allSearchableFields = [
            "orderID",
            "firstName",
            "lastName",
            "email",
            "status",
            "paymentMethod",
            "make",
            "carModel",
            "color",
            "vin",
            "address",
            "city",
            "state",
          ];
          const searchConditions = allSearchableFields
            .map((field) => {
              if (field === "orderID") {
                const numericSearch = parseInt(search);
                if (!isNaN(numericSearch)) {
                  return { [field]: numericSearch };
                }
                return null;
              }
              return { [field]: { $regex: search, $options: "i" } };
            })
            .filter((condition) => condition !== null);

          filter.$or = searchConditions;
        }
      }

      const pageSize = first || 10;
      const currentPage = Math.max(1, page || 1);
      const skip = (currentPage - 1) * pageSize;

      const docs = await Order.find(filter)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(pageSize);

      const totalCount = await Order.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / pageSize);

      const edges = docs.map((doc) => ({
        node: doc.toObject({ virtuals: false }),
        cursor: toCursor(doc._id.toString()),
      }));

      return {
        edges,
        pageInfo: {
          endCursor: edges.length ? edges[edges.length - 1].cursor : null,
          hasNextPage: currentPage < totalPages,
        },
        totalCount,
      };
    },
  },
};

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    ...ordersResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...analyticsResolvers.Mutation,
  },
};
