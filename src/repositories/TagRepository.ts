import { Expression, SqlBool } from 'kysely';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { Tag, InsertableTag, UpdateableTag, PostTag } from '@/types/models';

interface GetTagsParams {
    criteria?: Partial<Tag>
}

export default class TagRepository extends DatabaseRepository {
    getTags(params: GetTagsParams = {}) {
        const {criteria} = params

        return this.getDB()
            .selectFrom('tags')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        eb('tags.id', '=', criteria.id)
                    }

                    if (criteria.name) {
                        eb('tags.name', '=', criteria.name)
                    }
                }

                return eb.and(filters)
            })
            .selectAll()
            .execute()
    }

    findTag(id: number) {
        return this.getDB()
            .selectFrom('tags')
            .where('tags.id', '=', id)
            .selectAll()
            .executeTakeFirst()
    }

    createTag(data: InsertableTag) {
        return this.getDB()
            .insertInto('tags')
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    updateTag(id: number, data: UpdateableTag) {
        return this.getDB()
            .updateTable('tags')
            .set(data)
            .where('tags.id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    deleteTag(id: number) {
        return this.getDB()
            .deleteFrom('tags')
            .where('tags.id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()
    }
}
