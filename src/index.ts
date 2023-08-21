import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import { Context, createContext } from './context';
import { config } from 'dotenv';
import cors from "cors";

config()

const main = async () => {

  const app = express();
  app.use(cors());

  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: [ HelloResolver, PostResolver, UserResolver ],
      validate: false,
    }),
    context: ({ req, res }) => createContext({ req, res })
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;

  app.listen(port, () => console.log(`\
    🚀 Server ready at: ${port}
  `));

  app.get('/app/health', (_,res) => res.send({ status: 'OK' }))
}

main().catch(err => {
  console.log(err);
});
