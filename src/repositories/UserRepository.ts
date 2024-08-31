import { Expression, sql, SqlBool } from 'kysely';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { User, InsertableUser, UpdateableUser } from '@/types/models';

export interface GetUsersParams {
    page: number
    pageSize: number
    criteria?: Partial<User>
}

export default class UserRepository extends DatabaseRepository {
    getUsers(params: GetUsersParams) {
        const { page, pageSize, criteria } = params

        const offset = (page - 1) * pageSize

        return this.getDB()
            .selectFrom('users')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        filters.push(eb('users.id', '=', criteria.id))
                    }

                    if (criteria.email) {
                        filters.push(eb('users.email', '=', criteria.email))
                    }

                    if (criteria.name) {
                        filters.push(eb('users.name', '=', criteria.name))
                    }
                }

                return eb.and(filters)
            })
            .selectAll('users')
            .limit(pageSize)
            .offset(offset)
            .orderBy('users.id')
            .execute()
    }

    async getTotalUsers(criteria?: Partial<User>) {
        const [{total}] = await this.getDB()
            .selectFrom('users')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        filters.push(eb('users.id', '=', criteria.id))
                    }

                    if (criteria.email) {
                        filters.push(eb('users.email', '=', criteria.email))
                    }

                    if (criteria.name) {
                        filters.push(eb('users.name', '=', criteria.name))
                    }
                }

                return eb.and(filters)
            })
            .select(sql<number>`COUNT(*)`.as('total'))
            .execute()

        return +total
    }

    findUser(id: number) {
        return this.getDB()
            .selectFrom('users')
            .where('users.id', '=', id)
            .selectAll('users')
            .executeTakeFirst()
    }

    createUser(data: InsertableUser) {
        return this.getDB()
            .insertInto('users')
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    updateUser(id: number, data: UpdateableUser) {
        return this.getDB()
            .updateTable('users')
            .set(data)
            .where('users.id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    deleteUser(id: number) {
        return this.getDB()
            .deleteFrom('users')
            .where('users.id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()
    }
}
