import "reflect-metadata";
// import { MikroORM } from '@mikro-orm/core';
// import microDefault from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { Context, createContext } from './context'

const main = async () => {
  // const orm = await MikroORM.init(microDefault);
  // await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: [ HelloResolver, PostResolver ],
      validate: false,
    }),
    context: createContext
  });
  // const { url } = await startStandaloneServer(apolloServer, {
  //   context: createContext,
  //   listen: { port: 4000 }
  // })
  
  // console.log(`\
  //   🚀 Server ready at: ${url}
  //   ⭐️ See sample queries: http://pris.ly/e/js/graphql#using-the-graphql-api
  // `)
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(3000, () => console.log(`Server listening on port 3000....!`));

  // const post = orm.em.create(Post, {title: 'Hello World'});
  // await orm.em.persistAndFlush(post);
}

main().catch(err => {
  console.log(err);
});
