import { Insertable, Selectable, Updateable } from "kysely";
import { Posts, PostTags, Tags, Users, Comments } from "@/types/db";

export type User = Selectable<Users>;
export type InsertableUser = Insertable<Users>;
export type UpdateableUser = Updateable<Users>;

export type Post = Selectable<Posts>;
export type InsertablePost = Insertable<Posts>;
export type UpdateablePost = Updateable<Posts>;

export type PostTag = Selectable<PostTags>;
export type InsertablePostTag = Insertable<PostTags>;

export type Tag = Selectable<Tags>;
export type InsertableTag = Insertable<Tags>;
export type UpdateableTag = Updateable<Tags>;

export type Comment = Selectable<Comments>;
export type InsertableComment = Insertable<Comments>;
export type UpdateableComment = Updateable<Comments>;
export type CommentRelations = ("user" | "post")[];
