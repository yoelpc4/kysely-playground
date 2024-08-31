import { db } from '@/database';
import DatabaseRepository from '@/repositories/DatabaseRepository';

export default class TransactionalService {
    private databaseRepositories: DatabaseRepository[] = []

    protected registerForTransaction(...repositories: DatabaseRepository[]) {
        this.databaseRepositories.push(...repositories)

        return this
    }

    protected async executeTransaction<T>(transaction: () => Promise<T>) {
        if (!this.databaseRepositories) {
            throw new Error('No registered database repositories')
        }

        return await db.transaction().execute<T>(async (trx) => {
            for (const repository of this.databaseRepositories) {
                repository.setTransaction(trx)
            }

            const result = await transaction()

            for (const repository of this.databaseRepositories) {
                repository.unsetTransaction()
            }

            // unregister repositories from transaction
            this.databaseRepositories = []

            return result
        })
    }
}
