import { Field } from "type-graphql";
import { Post } from "./Post";
import { User } from "./User";

export class Updoot {

  @Field()
  value: number;

  @Field()
  userId: number;

  @Field(() => User)
  user: User;

  @Field()
  postId: number;

  @Field(() => Post)
  post: Post;
}