import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { configDotenv } from "dotenv";

configDotenv();

export default {
  migrations: {
    disableForeignKeys: false,
    path: path.join(__dirname, './migrations'),
    glob: '!(*.d).{js,ts}',
  },
  entities: [Post],
  clientUrl: process.env.DATABASE_URI,
  driver: PostgreSqlDriver,
  debug: !__prod__,
  allowGlobalContext: true,
  driverOptions: {
  connection: {
    ssl: {
      rejectUnauthorized: false, 
    },
  },
  }
} as Parameters<typeof MikroORM.init>[0];