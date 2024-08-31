import UserRepository from '@/repositories/UserRepository';
import { InsertableUser, UpdateableUser, User } from '@/types/models';

export default class UserService {
    private readonly userRepository = new UserRepository()

    async getUsers(query: Record<string, unknown>) {
        if (!query.page) {
            throw new Error('page is required')
        }

        if (!query.pageSize) {
            throw new Error('page size is required')
        }

        const page = +query.page

        const pageSize = +query.pageSize

        const criteria = (query.criteria as Partial<User> | undefined)

        const users = await this.userRepository.getUsers({
            page,
            pageSize,
            criteria,
        })

        const total = await this.userRepository.getTotalUsers(criteria)

        return {
            users,
            meta: {
                page,
                pageSize,
                total,
            },
        }
    }

    findUser(id: number) {
        return this.userRepository.findUser(id)
    }

    createUser(data: InsertableUser) {
        return this.userRepository.createUser(data)
    }

    updateUser(id: number, data: UpdateableUser) {
        return this.userRepository.updateUser(id, data)
    }

    async deleteUser(id: number) {
        await this.userRepository.deleteUser(id)
    }
}
