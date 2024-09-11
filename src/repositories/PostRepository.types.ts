import { Post, Tag, User } from '@/types/models';

export type GetPostsCriteria = Partial<Post> & {
    hasAuthor?: boolean
    author?: Partial<User>
    hasTags?: boolean
    tags?: Partial<Tag>
}

export type GetPostsIncludes = ('author'|'tags')[]

export type GetPostsSorts = (
    'id'
    | '-id'
    | 'title'
    | '-title'
    | 'createdAt'
    | '-createdAt'
    | 'author.name'
    | '-author.name'
    )[]

export type GetPostsParams = {
    page: number
    pageSize: number
    criteria?: GetPostsCriteria
    includes?: GetPostsIncludes
    sorts?: GetPostsSorts
}
