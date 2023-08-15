import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import { Context, createContext } from './context';
import RedisStore from "connect-redis"
import session from "express-session";
import { createClient } from "redis";
import cors from "cors";

const main = async () => {

  const app = express();
  app.use(cors());

  const redisClient = createClient()
  redisClient.connect().catch(console.error)

  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: [ HelloResolver, PostResolver, UserResolver ],
      validate: false,
    }),
    context: ({ req, res }) => createContext({ req, res })
  });

  app.use(
    session({
      name: 'serv',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        sameSite: "lax",
        httpOnly: true 
      },
      resave: false, 
      saveUninitialized: false, 
      secret: "keyboard cat",
    })
  )
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log(`\
    🚀 Server ready at: 4000
  `));
}

main().catch(err => {
  console.log(err);
});
