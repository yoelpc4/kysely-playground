import { Expression, SelectExpression, sql, SqlBool } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { DB } from '@/types/db';
import { InsertablePost, Post, PostRelations, UpdateablePost } from '@/types/models';

export interface GetPostsParams {
    page: number
    pageSize: number
    criteria?: Partial<Post>
    includes?: PostRelations
}

export interface FindPostParams {
    includes?: PostRelations
}

export default class PostRepository extends DatabaseRepository {
    getPosts(params: GetPostsParams) {
        const { page, pageSize, criteria, includes } = params

        const offset = (page - 1) * pageSize

        return this.getDB()
            .selectFrom('posts')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        filters.push(eb('posts.id', '=', criteria.id))
                    }

                    if (criteria.authorId) {
                        filters.push(eb('posts.authorId', '=', criteria.authorId))
                    }

                    if (criteria.title) {
                        filters.push(eb('posts.title', '=', criteria.title))
                    }
                }

                return eb.and(filters)
            })
            .selectAll('posts')
            .select((eb) => {
                const selections: SelectExpression<DB, 'posts'>[] = []

                if (includes) {
                    if (includes.includes('author')) {
                        selections.push(this.author(eb.ref('posts.authorId')).as('author'))
                    }

                    if (includes.includes('tags')) {
                        selections.push(this.tags(eb.ref('posts.id')).as('tags'))
                    }
                }

                return selections
            })
            .orderBy('posts.id')
            .limit(pageSize)
            .offset(offset)
            .execute()
    }

    async getTotalPosts(criteria?: Partial<Post>) {
        const [{total}] = await this.getDB()
            .selectFrom('posts')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        filters.push(eb('posts.id', '=', criteria.id))
                    }

                    if (criteria.authorId) {
                        filters.push(eb('posts.authorId', '=', criteria.authorId))
                    }

                    if (criteria.title) {
                        filters.push(eb('posts.title', '=', criteria.title))
                    }
                }

                return eb.and(filters)
            })
            .select(sql<number>`COUNT(*)`.as('total'))
            .execute()

        return +total
    }

    findPost(id: number, params: FindPostParams = {}) {
        const { includes } = params

        return this.getDB()
            .selectFrom('posts')
            .where('posts.id', '=', id)
            .selectAll('posts')
            .select((eb) => {
                const selections: SelectExpression<DB, 'posts'>[] = []

                if (includes) {
                    if (includes.includes('author')) {
                        selections.push(this.author(eb.ref('posts.authorId')).as('author'))
                    }

                    if (includes.includes('tags')) {
                        selections.push(this.tags(eb.ref('posts.id')).as('tags'))
                    }
                }

                return selections
            })
            .executeTakeFirst()
    }

    createPost(data: InsertablePost) {
        return this.getDB()
            .insertInto('posts')
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    updatePost(id: number, data: UpdateablePost) {
        return this.getDB()
            .updateTable('posts')
            .set(data)
            .where('posts.id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    async deletePost(id: number) {
        await this.getDB()
            .deleteFrom('posts')
            .where('posts.id', '=', id)
            .executeTakeFirstOrThrow()
    }

    protected author(authorId: Expression<number>) {
        return jsonObjectFrom(
            this.getDB()
                .selectFrom('users')
                .whereRef('users.id', '=', authorId)
                .selectAll('users')
        )
    }

    protected tags(postId: Expression<number>) {
        return jsonArrayFrom(
            this.getDB()
                .selectFrom('tags')
                .innerJoin(
                    'postTags',
                    (join) => join
                        .onRef('postTags.tagId', '=', 'tags.id')
                        .onRef('postTags.postId', '=', postId)
                )
                .selectAll('tags')
        )
    }
}
