import TransactionalService from '@/services/TransactionalService';
import PostRepository, { GetPostsCriteria, GetPostsSorts, GetPostsIncludes } from '@/repositories/PostRepository';
import PostTagRepository from '@/repositories/PostTagRepository';
import { CreatePostData, UpdatePostData } from '@/services/PostService.types';

export * from '@/services/PostService.types'

export default class PostService extends TransactionalService {
    private readonly postRepository = new PostRepository()

    private readonly postTagRepository = new PostTagRepository()

    async getPosts(query: Record<string, unknown>) {
        if (!query.page) {
            throw new Error('page is required')
        }

        if (!query.pageSize) {
            throw new Error('page size is required')
        }

        const page = +query.page

        const pageSize = +query.pageSize

        const criteria = (query.criteria as GetPostsCriteria | undefined)

        const includes = (query.includes as GetPostsIncludes | undefined)

        const sorts = (query.sorts as GetPostsSorts | undefined)

        const posts = await this.postRepository.getPosts({
            page,
            pageSize,
            criteria,
            includes,
            sorts,
        })

        const total = await this.postRepository.getTotalPosts(criteria)

        return {
            posts,
            meta: {
                page,
                pageSize,
                total,
            },
        }
    }

    findPost(id: number, query?: Record<string, unknown>) {
        return this.postRepository.findPost(id, query?.includes as GetPostsIncludes | undefined)
    }

    async createPost(data: CreatePostData) {
        const {tagIds, ...postData} = data

        return await this
            .registerForTransaction(
                this.postRepository,
                this.postTagRepository,
            )
            .executeTransaction(async () => {
                const post = await this.postRepository.createPost(postData)

                await this.attachTags(post.id, tagIds)

                return post
            })
    }

    async updatePost(id: number, data: UpdatePostData) {
        const {tagIds, ...postData} = data

        return await this
            .registerForTransaction(
                this.postRepository,
                this.postTagRepository,
            )
            .executeTransaction(async () => {
                const post = await this.postRepository.updatePost(id, {
                    ...postData,
                    updatedAt: new Date(),
                })

                await this.syncTags(id, tagIds)

                return post
            })
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
