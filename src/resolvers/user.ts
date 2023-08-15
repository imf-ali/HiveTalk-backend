import { Context } from 'src/context';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';

@InputType()
class UsernamePasswordInputType {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field?: string;

  @Field()
  message?: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => User, { nullable: true })
  me(@Ctx() { prisma, req } : Context){
    return prisma.user.findUnique({ where: { id: req.session.userId } })
  }

	@Mutation(() => UserResponse)
	async register(
    @Arg('options') options: UsernamePasswordInputType,
    @Ctx() { prisma, req } : Context
  ) : Promise<UserResponse> {

    if(options.username.length <= 3){
      return {
        errors: [{
          field: 'username',
          message: 'Username length should be greater than 3'
        }]
      }
    }

    if(options.password.length <= 5){
      return {
        errors: [{
          field: 'password',
          message: 'Password length should be greater than 5'
        }]
      }
    }
		const user =  await prisma.user.create({
      data: {
        username: options.username,
        password: await bcrypt.hash(options.password, 8)
      }
    });
    req.session.userId = user.id;
    return {
      user
    }
	}

  @Mutation(() => UserResponse)
	async login(
    @Arg('options') options: UsernamePasswordInputType,
    @Ctx() { prisma, req } : Context
  ) : Promise<UserResponse> {
		const user = await prisma.user.findFirst({ where: { username: options.username } });
    if(!user){
      return {
        errors: [{
          field: 'username',
          message: 'User Not found!'
        }]
      }
    }
    if(! await bcrypt.compare(options.password, user.password)){
      return {
        errors: [{
          field: 'password',
          message: 'Password not correct!'
        }]
      }
    }
    req.session.userId = user.id;
    console.log(req.session.id);
    
    return {
      user
    }
	}
}
