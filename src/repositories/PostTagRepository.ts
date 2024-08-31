import { Expression, SqlBool } from 'kysely';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { InsertablePostTag, PostTag } from '@/types/models';

interface GetPostTagsParams {
    criteria?: Partial<PostTag>
}

export default class PostTagRepository extends DatabaseRepository {
    getPostTags(params: GetPostTagsParams = {}) {
        const { criteria } = params

        return this.getDB()
            .selectFrom('postTags')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.postId) {
                        filters.push(eb('postTags.postId', '=', criteria.postId))
                    }

                    if (criteria.tagId) {
                        filters.push(eb('postTags.tagId', '=', criteria.tagId))
                    }
                }

                return eb.and(filters)
            })
            .selectAll()
            .execute()
    }

    createPostTags(data: InsertablePostTag[]) {
        return this.getDB()
            .insertInto('postTags')
            .values(data)
            .returningAll()
            .execute()
    }

    deletePostTags(postId: number, tagIds: number[] = []) {
        return this.getDB()
            .deleteFrom('postTags')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = [
                    eb('postTags.postId', '=', postId)
                ]

                if (tagIds.length > 0) {
                    filters.push(eb('postTags.tagId', 'in', tagIds))
                }

                return eb.and(filters)
            })
            .execute()
    }
}
