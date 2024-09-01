import { Expression, SelectExpression, sql, SqlBool } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { DB } from '@/types/db';
import { InsertablePost, Post, PostRelations, Tag, UpdateablePost, User } from '@/types/models';

export type GetPostsCriteria = Partial<Post> & {
    hasAuthor?: boolean
    author?: Partial<User>
    hasTags?: boolean
    tag?: Partial<Tag>
}

export interface GetPostsParams {
    page: number
    pageSize: number
    criteria?: GetPostsCriteria
    includes?: PostRelations
}

export interface FindPostParams {
    includes?: PostRelations
}

export default class PostRepository extends DatabaseRepository {
    getPosts(params: GetPostsParams) {
        const {page, pageSize, criteria, includes} = params

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

                    if (criteria.hasAuthor) {
                        filters.push(eb.exists(this.authorRows(eb.ref('posts.authorId'))))
                    } else if (criteria.author) {
                        filters.push(eb.exists(this.authorRows(eb.ref('posts.authorId'), criteria.author)))
                    }

                    if (criteria.hasTags) {
                        filters.push(eb.exists(this.tagRows(eb.ref('posts.id'))))
                    } else if (criteria.tag) {
                        filters.push(eb.exists(this.tagRows(eb.ref('posts.id'), criteria.tag)))
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

    async getTotalPosts(criteria?: GetPostsCriteria) {
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

                    if (criteria.hasAuthor) {
                        filters.push(eb.exists(this.authorRows(eb.ref('posts.authorId'))))
                    } else if (criteria.author) {
                        filters.push(eb.exists(this.authorRows(eb.ref('posts.authorId'), criteria.author)))
                    }

                    if (criteria.hasTags) {
                        filters.push(eb.exists(this.tagRows(eb.ref('posts.id'))))
                    } else if (criteria.tag) {
                        filters.push(eb.exists(this.tagRows(eb.ref('posts.id'), criteria.tag)))
                    }
                }

                return eb.and(filters)
            })
            .select(sql<number>`COUNT (*)`.as('total'))
            .execute()

        return +total
    }

    findPost(id: number, params: FindPostParams = {}) {
        const {includes} = params

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
                .selectFrom('users as authors')
                .whereRef('authors.id', '=', authorId)
                .selectAll('authors')
        )
    }

    protected authorRows(authorId: Expression<number>, criteria?: Partial<User>) {
        return this.getDB()
            .selectFrom('users as authors')
            .whereRef('authors.id', '=', authorId)
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.email) {
                        filters.push(eb('authors.email', '=', criteria.email))
                    }

                    if (criteria.name) {
                        filters.push(eb('authors.name', '=', criteria.name))
                    }
                }

                return eb.and(filters)
            })
            .select(sql<number>`1`.as('1'))
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

    protected tagRows(postId: Expression<number>, criteria?: Partial<Tag>) {
        return this.getDB()
            .selectFrom('tags')
            .innerJoin(
                'postTags',
                (join) => join
                    .onRef('postTags.tagId', '=', 'tags.id')
                    .onRef('postTags.postId', '=', postId)
            )
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.name) {
                        filters.push(eb('tags.name', '=', criteria.name))
                    }
                }

                return eb.and(filters)
            })
            .select(sql<number>`1`.as('1'))
    }
}
