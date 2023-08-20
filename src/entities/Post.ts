import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post {

  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: 'text'})
  title!: string;

  @Field()
  @Property({ type: 'text'})
  text!: string;

  @Field(() => Int, { defaultValue: 0 })
  points!: number;

  @Field()
  userId: number;

  @Field(() => User)
  user: User;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

} 