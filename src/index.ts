import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const app = express();
  app.use(cors());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  const port = process.env.PORT || 4447;
  app.listen({ port }, () => {
    console.log(`🚀  Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
})();
