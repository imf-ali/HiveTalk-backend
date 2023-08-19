import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
import { Context } from 'src/context';
import { extractUserId } from '../utils/Auth';

@InputType()
class PostInputType {
  @Field()
  title: string;

  @Field()
  text: string;

	@Field()
	token: string;
}

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { prisma }: Context): Promise<Post[]> {
		return prisma.post.findMany();
	} 

	@Query(() => Post, { nullable: true })
	post( 
		@Arg("id", () => Int) id: number,
		@Ctx() { prisma }: Context
	): Promise<Post | null> {
		return prisma.post.findUnique({ where: { id } });
	} 

	@Mutation(() => Post)
	async createPost( 
		@Arg("input") input: PostInputType, 
		@Ctx() { prisma }: Context
	): Promise<Post> {
		const userId = extractUserId(input.token);
		const post = await prisma.post.create({ 
			data: { 
				title: input.title,
				text: input.text,
				userId,
			}
		 });
		return post;
	}

	@Mutation(() => Post)
	async updatePost( 
		@Arg("id") id: number, 
		@Arg("title") title: string, 
		@Ctx() { prisma }: Context
	): Promise<Post | null> {
		// const userId = extractUserId(input.token);
		const post = await prisma.post.update({ 
			where: { id },
			data: { title }
		});
		return post;
	}
}
