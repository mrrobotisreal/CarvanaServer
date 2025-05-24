import { Order } from '../models/Order';
import { toCursor, fromCursor } from '../utils/encodeCursor';
import { Types } from 'mongoose';

export const resolvers = {
  Query: {
    orders: async (_: any, { first, after, search, searchFields }: any) => {
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

      if (after) {
        const afterFilter = {
          _id: { $gt: new Types.ObjectId(fromCursor(after)) },
        };
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, afterFilter];
          delete filter.$or;
        } else {
          Object.assign(filter, afterFilter);
        }
      }

      const docs = await Order.find(filter).sort({ _id: 1 }).limit(first);

      const edges = docs.map((doc) => ({
        node: doc.toObject({ virtuals: false }),
        cursor: toCursor(doc._id.toString()),
      }));

      const countFilter: any = {};
      if (search) {
        if (searchFields && searchFields.length > 0) {
          const searchConditions = searchFields.map((field: string) => ({
            [field]: { $regex: search, $options: "i" },
          }));
          countFilter.$or = searchConditions;
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

          countFilter.$or = searchConditions;
        }
      }

      const totalCount = await Order.countDocuments(countFilter);

      return {
        edges,
        pageInfo: {
          endCursor: edges.length ? edges[edges.length - 1].cursor : null,
          hasNextPage: docs.length === first,
        },
        totalCount,
      };
    },
  },
};
