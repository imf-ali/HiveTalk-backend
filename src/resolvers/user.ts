import { Context } from 'src/context';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { createToken, extractUserId } from '../utils/Auth';

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

  @Field(() => String, { nullable: true })
  token?: string;
}

@Resolver()
export class UserResolver {

  @Query(() => UserResponse, { nullable: true })
  async me(
    @Arg('token') token: string,
    @Ctx() { prisma } : Context
  ){
    const user = await prisma.user.findUnique({ 
      where: { 
        id: extractUserId(token),
        tokens: {
          has: token
        }
      } 
    })
    if(!user){
      return {
        errors: [{
          field: 'token',
          message: 'Token is invalid or expired'
        }]
      }
    }
    return {
      user
    }
  }

	@Mutation(() => UserResponse)
	async register(
    @Arg('options') options: UsernamePasswordInputType,
    @Ctx() { prisma } : Context
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
    let user = await prisma.user.findUnique({
      where:{
        username: options.username
      }
    })
    if(user) {
      return {
        errors: [{
          field: 'Username',
          message: 'Username already exists'
        }]
      }
    }
		user = await prisma.user.create({
      data: {
        username: options.username,
        password: await bcrypt.hash(options.password, 8),
      }
    });
    const token = createToken(user.id);
    await prisma.user.update({ 
			where: { id: user.id },
			data: { 
        tokens: { push: token },
      }
		});
    return {
      user,
      token
    }
	}

  @Mutation(() => UserResponse)
	async login(
    @Arg('options') options: UsernamePasswordInputType,
    @Ctx() { prisma } : Context
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
    if(!await bcrypt.compare(options.password, user.password)){
      return {
        errors: [{
          field: 'password',
          message: 'Password not correct!'
        }]
      }
    }
    const token = createToken(user.id);
    await prisma.user.update({ 
			where: { id: user.id },
			data: { 
        tokens: { push: token }, 
      }
		});
    return {
      user,
      token
    }
	}

  @Mutation(() => UserResponse)
  async logout(
    @Arg('token') token: string,
    @Ctx() { prisma } : Context
  ){
    const userId = extractUserId(token);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        tokens: {
          has: token
        }
      }
    })
    if(!user){
      return {
        errors: [{
          field: 'username',
          message: 'User Not found!'
        }]
      }
    }
    const tokensList = user.tokens.filter(tokenData => tokenData !== token);
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        tokens: {
          set: tokensList,
        }
      }
    })
    return {
      user
    }
  }
}
