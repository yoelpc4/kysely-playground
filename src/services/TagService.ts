import TagRepository from '@/repositories/TagRepository';
import { InsertableTag, Tag, UpdateableTag, User } from '@/types/models';

export default class TagService {
    private readonly tagRepository = new TagRepository()

    getTags(query: Record<string, unknown>) {
        const criteria = (query.criteria as Partial<User> | undefined)

        return this.tagRepository.getTags({
            criteria,
        });
    }

    findTag(id: number) {
        return this.tagRepository.findTag(id)
    }

    createTag(data: InsertableTag) {
        return this.tagRepository.createTag(data)
    }

    updateTag(id: number, data: UpdateableTag) {
        return this.tagRepository.updateTag(id, data)
    }

    async deleteTag(id: number) {
        await this.tagRepository.deleteTag(id)
    }
}
