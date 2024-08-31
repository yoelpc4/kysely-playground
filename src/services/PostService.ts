import TransactionalService from '@/services/TransactionalService';
import PostRepository from '@/repositories/PostRepository';
import PostTagRepository from '@/repositories/PostTagRepository';
import { InsertablePost, Post, UpdateablePost } from '@/types/models';

export default class PostService extends TransactionalService {
    private readonly postRepository = new PostRepository()

    private readonly postTagRepository = new PostTagRepository()

    getPostsWithAuthorAndTags(criteria: Partial<Post>) {
        return this.postRepository.getPosts({
            criteria,
            includes: ['author', 'tags'],
        })
    }

    findPost(id: number) {
        return this.postRepository.findPost(id)
    }

    findPostWithAuthorAndTags(id: number) {
        return this.postRepository.findPost(id, {
            includes: ['author', 'tags'],
        })
    }

    async createPost(data: InsertablePost & { tagIds: number[] }) {
        const {tagIds, ...postData} = data

        const post = await this
            .registerForTransaction(
                this.postRepository,
                this.postTagRepository,
            )
            .executeTransaction(async () => {
                const post = await this.postRepository.createPost(postData)

                await this.attachTags(post.id, tagIds)

                return post
            })

        return await this.findPostWithAuthorAndTags(post.id)
    }

    async updatePost(id: number, data: UpdateablePost & { tagIds: number[] }) {
        const {tagIds, ...postData} = data

        await this
            .registerForTransaction(
                this.postRepository,
                this.postTagRepository,
            )
            .executeTransaction(async () => {
                await this.postRepository.updatePost(id, {
                    ...postData,
                    updatedAt: new Date(),
                })

                await this.syncTags(id, tagIds)
            })

        return await this.findPostWithAuthorAndTags(id)
    }

    async deletePost(id: number) {
        await this
            .registerForTransaction(
                this.postRepository,
                this.postTagRepository,
            )
            .executeTransaction(async () => {
                await this.detachTags(id)

                await this.postRepository.deletePost(id)
            })
    }

    private attachTags(postId: number, tagIds: number[]) {
        return this.postTagRepository.createPostTags(tagIds.map(tagId => ({
            postId,
            tagId,
        })))
    }

    private detachTags(postId: number, tagIds?: number[]) {
        return this.postTagRepository.deletePostTags(postId, tagIds)
    }

    private async syncTags(postId: number, tagIds: number[]) {
        const currentPostTags = await this.postTagRepository.getPostTags({
            criteria: {
                postId,
            },
        })

        const currentTagIds = currentPostTags.map(postTag => postTag.tagId)

        const newTagIds = tagIds.filter(tagId => !currentTagIds.includes(tagId))

        const unselectedTagIds = currentTagIds.filter(currentPostTagId => !tagIds.includes(currentPostTagId))

        if (newTagIds.length > 0) {
            await this.attachTags(postId, newTagIds)
        }

        if (unselectedTagIds.length > 0) {
            await this.detachTags(postId, unselectedTagIds)
        }
    }
}
