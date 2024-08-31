import { Expression, SqlBool } from 'kysely';
import DatabaseRepository from '@/repositories/DatabaseRepository';
import { User, InsertableUser, UpdateableUser } from '@/types/models';

interface GetUsersParams {
    criteria?: Partial<User>
}

export default class UserRepository extends DatabaseRepository {
    getUsers(params: GetUsersParams = {}) {
        const { criteria } = params

        return this.getDB()
            .selectFrom('users')
            .where((eb) => {
                const filters: Expression<SqlBool>[] = []

                if (criteria) {
                    if (criteria.id) {
                        eb('users.id', '=', criteria.id)
                    }

                    if (criteria.email) {
                        eb('users.email', '=', criteria.email)
                    }

                    if (criteria.name) {
                        eb('users.name', '=', criteria.name)
                    }
                }

                return eb.and(filters)
            })
            .selectAll()
            .execute()
    }

    findUser(id: number) {
        return this.getDB()
            .selectFrom('users')
            .where('users.id', '=', id)
            .selectAll()
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
