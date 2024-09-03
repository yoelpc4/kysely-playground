import { Kysely, Transaction } from 'kysely';
import { db } from '@/database';
import { DB } from '@/types/db'

export default abstract class DatabaseRepository {
    private trx: Transaction<DB> | null = null

    setTransaction(trx: Transaction<DB>) {
        this.trx = trx
    }

    unsetTransaction() {
        this.trx = null
    }

    protected getDB(): Kysely<DB> | Transaction<DB> {
        return this.trx ?? db
    }

    protected getOffset(page: number, pageSize: number) {
        return (page - 1) * pageSize
    }
}
