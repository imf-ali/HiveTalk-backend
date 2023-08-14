import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
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
		@Ctx() { prisma }: Context
	): Promise<Post | null> {
		return prisma.post.findUnique({ where: { id } });
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
		@Ctx() { prisma }: Context
	): Promise<Post | null> {
		const post = await prisma.post.update({ 
			where: { id },
			data: { title }
		});
		return post;
	}
}
