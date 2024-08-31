import UserRepository from '@/repositories/UserRepository';
import { InsertableUser, UpdateableUser, User } from '@/types/models';

export default class UserService {
    private readonly userRepository = new UserRepository()

    getUsers(criteria: Partial<User>) {
        return this.userRepository.getUsers({
            criteria,
        });
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
