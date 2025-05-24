import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from "https";
import fs from "fs";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const app = express();
  app.use(cors());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  const port = process.env.PORT || 4447;
  const isDev = process.env.DEV === "true";

  if (isDev) {
    app.listen({ port }, () => {
      console.log(
        `🚀  Development server ready at http://localhost:${port}${server.graphqlPath}`
      );
    });
  } else {
    const sslOptions = {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/carvana.api.winapps.io/privkey.pem"
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/carvana.api.winapps.io/fullchain.pem"
      ),
    };

    const httpsServer = https.createServer(sslOptions, app);

    const httpsPort = port;

    httpsServer.listen(httpsPort, () => {
      console.log(
        `🚀  HTTPS server ready at https://carvana.api.winapps.io:${httpsPort}${server.graphqlPath}`
      );
    });
  }
})();
