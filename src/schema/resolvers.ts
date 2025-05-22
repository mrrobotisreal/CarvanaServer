import { Order } from '../models/Order';
import { toCursor, fromCursor } from '../utils/encodeCursor';
import { Types } from 'mongoose';

export const resolvers = {
  Query: {
    orders: async (_: any, { first, after, search }: any) => {
      const filter: any = {};
      if (search) {
        filter.$text = { $search: search };
      }
      if (after) {
        filter._id = { $gt: new Types.ObjectId(fromCursor(after)) };
      }

      const docs = await Order.find(filter)
        .sort({ _id: 1 })
        .limit(first);

      const edges = docs.map((doc) => ({
        node: doc.toObject({ virtuals: false }),
        cursor: toCursor(doc._id.toString()),
      }));

      const totalCount = await Order.countDocuments(filter);

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
