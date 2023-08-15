import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import { Context, createContext } from './context'

const main = async () => {

  const app = express();

  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: [ HelloResolver, PostResolver, UserResolver ],
      validate: false,
    }),
    context: createContext
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(3000, () => console.log(`\
  🚀 Server ready at: 3000
`));
}

main().catch(err => {
  console.log(err);
});
