import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { Context } from 'src/context';

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { prisma }: Context): Promise<Post[]> {
		return prisma.post.findMany();
	} 

	@Query(() => Post, { nullable: true })
	post( 
		@Arg("id", () => Int) id: number,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		return em.findOne(Post, { id });
	} 

	@Mutation(() => Post)
	async createPost( 
		@Arg("title") title: string, 
		@Ctx() { prisma }: Context
	): Promise<Post> {
		const post = prisma.post.create({ 
			data: { title }
		 });
		return post;
	}

	@Mutation(() => Post)
	async updatePost( 
		@Arg("id") id: number, 
		@Arg("title") title: string, 
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id })
		if(!post || typeof title === "undefined")
			return null;
		post.title = title;
		await em.persistAndFlush(post);
		return post;
	}
}
