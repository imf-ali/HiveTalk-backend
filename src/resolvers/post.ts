import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
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

@ObjectType()
class PostError {
	@Field()
	field?: string;

	@Field()
	message?: string;
}

@ObjectType()
class PostResponse {
	@Field(() => [PostError], { nullable: true })
	errors?: PostError[];

	@Field(() => [Post], { nullable: true })
	posts?: Post[];
}

@ObjectType()
class PostEachResponse {
	@Field(() => [PostError], { nullable: true })
	errors?: PostError[];

	@Field(() => Post, { nullable: true })
	post?: Post;
}

@ObjectType()
class VoteResponse {
	@Field(() => Int, { nullable: true })
	points?: number;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Arg('token', { nullable: true }) token: string,
		@Ctx() { prisma }: Context,
	) {
		if (!token) return null;
		const userId = extractUserId(token);
		const updoot = await prisma.updoot.findMany({
			where: {
				userId,
				postId: post.id,
			},
		});
		return updoot.length ? updoot[0].value : null;
	}

	@Mutation(() => VoteResponse)
	async vote(
		@Arg('postId') postId: number,
		@Arg('token') token: string,
		@Arg('value') value: number,
		@Ctx() { prisma }: Context,
	) {
		const userId = extractUserId(token);
		const point = value > 0 ? 1 : -1;
		let postData = null;
		const updoot = await prisma.updoot.findMany({
			where: {
				userId,
				postId,
			},
		});
		if (updoot.length && updoot[0].value !== point) {
			await prisma.updoot.updateMany({
				where: {
					userId,
					postId,
				},
				data: {
					value: point,
				},
			});
			postData = await prisma.post.update({
				where: {
					id: postId,
				},
				data: {
					points: {
						increment: 2 * point,
					},
				},
			});
		} else if (!updoot.length) {
			await prisma.updoot.create({
				data: {
					userId,
					postId,
					value: point,
				},
			});
			postData = await prisma.post.update({
				where: {
					id: postId,
				},
				data: {
					points: {
						increment: point,
					},
				},
			});
		}
		return { points: postData?.points };
	}

	@Query(() => PostResponse)
	async getPosts(@Ctx() { prisma }: Context) {
		const posts = await prisma.post.findMany({
			include: {
				user: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return { posts };
	}

	@Query(() => PostEachResponse, { nullable: true })
	async post(@Arg('id', () => Int) id: number, @Ctx() { prisma }: Context) {
		const post = await prisma.post.findUnique({
			where: { id },
			include: {
				user: true,
			},
		});
		if (!post) {
			return {
				errors: [
					{
						field: 'Not Found',
						message: 'Post not found',
					},
				],
			};
		}
		return { post };
	}

	@Mutation(() => Post)
	async createPost(
		@Arg('input') input: PostInputType,
		@Ctx() { prisma }: Context,
	): Promise<Post> {
		const userId = extractUserId(input.token);
		const post = await prisma.post.create({
			data: {
				title: input.title,
				text: input.text,
				userId,
			},
			include: {
				user: true,
			},
		});
		return post;
	}

	@Mutation(() => PostEachResponse)
	async updatePost(
		@Arg('id') id: number,
		@Arg('title') title: string,
		@Arg('text') text: string,
		@Arg('token') token: string,
		@Ctx() { prisma }: Context,
	) {
		const userId = extractUserId(token);
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				tokens: {
					has: token,
				},
			},
		});
		if (!user) {
			return {
				errors: [
					{
						field: 'User error',
						message: 'Session expired or user not found',
					},
				],
			};
		}
		const post = await prisma.post.update({
			where: { id },
			data: { title, text },
			include: {
				user: true,
			},
		});
		return { post };
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id') id: number,
		@Arg('token') token: string,
		@Ctx() { prisma }: Context,
	) {
		const userId = extractUserId(token);
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) return false;
		const post = await prisma.post.findUnique({
			where: {
				id,
				userId,
			},
		});
		if (!post) return false;
		await prisma.updoot.deleteMany({
			where: {
				postId: id,
			},
		});
		await prisma.post.deleteMany({
			where: {
				id: id,
				userId: userId,
			},
		});
		return true;
	}
}
