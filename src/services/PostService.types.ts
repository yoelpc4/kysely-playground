import { InsertablePost, UpdateablePost } from '@/types/models';

export type CreatePostData = InsertablePost & { tagIds: number[] }

export type UpdatePostData = UpdateablePost & { tagIds: number[] }
