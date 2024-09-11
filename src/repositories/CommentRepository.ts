import {
  InsertableComment,
  Comment,
  User,
  Post,
  CommentRelations,
  UpdateableComment,
} from "@/types/models";
import {
  Expression,
  expressionBuilder,
  SelectExpression,
  sql,
  SqlBool,
} from "kysely";
import DatabaseRepository from "./DatabaseRepository";
import { DB } from "@/types/db";
import { jsonObjectFrom } from "kysely/helpers/postgres";

export type GetCommentsCriteria = Partial<Comment> & {
  hasUser?: boolean;
  user?: Partial<User>;
  hasPost?: boolean;
  post?: Partial<Post>;
};

export interface GetCommentsParams {
  page: number;
  pageSize: number;
  criteria?: GetCommentsCriteria;
  includes?: CommentRelations;
}

export interface FindCommentParams {
  includes?: CommentRelations;
}

export class CommentRepository extends DatabaseRepository {
  createComment(data: InsertableComment) {
    return this.getDB()
      .insertInto("comments")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  getComments({
    page,
    pageSize,
    criteria = {},
    includes = [],
  }: GetCommentsParams) {
    let query = this.getDB()
      .selectFrom("comments")
      .where((eb) => {
        const filters: Expression<SqlBool>[] = [];

        if (criteria) {
          if (criteria.id) {
            filters.push(eb("comments.id", "=", criteria.id));
          }
          if (criteria.postId) {
            filters.push(eb("comments.postId", "=", criteria.postId));
          }
          if (criteria.userId) {
            filters.push(eb("comments.userId", "=", criteria.userId));
          }

          if (criteria.hasUser) {
            filters.push(this.hasUser(eb.ref("comments.userId")));
          } else if (criteria.user) {
            filters.push(
              this.hasUser(eb.ref("comments.userId"), criteria.user)
            );
          }

          if (criteria.hasPost) {
            filters.push(this.hasPost(eb.ref("comments.postId")));
          } else if (criteria.post) {
            filters.push(
              eb.exists(this.hasPost(eb.ref("comments.postId"), criteria.post))
            );
          }
        }

        return eb.and(filters);
      })
      .selectAll("comments")
      .$if(includes.includes("user"), (qb) =>
        qb.select((eb) => this.user(eb.ref("comments.userId")).as("user"))
      )
      .$if(includes.includes("post"), (qb) =>
        qb.select((eb) => this.post(eb.ref("comments.postId")).as("post"))
      )
      .limit(pageSize)
      .offset(this.getOffset(page, pageSize));

    return query.execute();
  }

  async getTotalComments(criteria?: GetCommentsCriteria) {
    const [{ total }] = await this.getDB()
      .selectFrom("comments")
      .where((eb) => {
        const filters: Expression<SqlBool>[] = [];
        if (criteria) {
          if (criteria.id) {
            filters.push(eb("comments.id", "=", criteria.id));
          }

          if (criteria.userId) {
            filters.push(eb("comments.userId", "=", criteria.userId));
          }

          if (criteria.postId) {
            filters.push(eb("comments.postId", "=", criteria.postId));
          }
        }

        return eb.and(filters);
      })
      .select(sql<number>`COUNT (*)`.as("total"))
      .execute();

    return +total;
  }

  findComment(id: number, { includes = [] }: FindCommentParams = {}) {
    return this.getDB()
      .selectFrom("comments")
      .where("comments.id", "=", id)
      .selectAll()
      .$if(includes.includes("user"), (qb) =>
        qb.select((eb) => this.user(eb.ref("comments.userId")).as("user"))
      )
      .$if(includes.includes("post"), (qb) =>
        qb.select((eb) => this.post(eb.ref("comments.postId")).as("post"))
      )
      .executeTakeFirst();
  }

  deleteComment(id: number) {
    return this.getDB().deleteFrom("comments").where("id", "=", id).execute();
  }

  async updateComment(
    id: number,
    data: Partial<UpdateableComment>
  ): Promise<Comment | undefined> {
    return this.getDB()
      .updateTable("comments")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  protected hasUser(userId: Expression<number>, criteria?: Partial<User>) {
    const { exists, selectFrom } = expressionBuilder<DB, never>();

    return exists(
      selectFrom("users")
        .whereRef("users.id", "=", userId)
        .where((eb) => {
          const filters: Expression<SqlBool>[] = [];

          if (criteria) {
            if (criteria.email) {
              filters.push(eb("users.email", "=", criteria.email));
            }

            if (criteria.name) {
              filters.push(eb("users.name", "=", criteria.name));
            }
          }

          return eb.and(filters);
        })
        .select(sql<number>`1`.as("1"))
    );
  }

  protected hasPost(postId: Expression<number>, criteria?: Partial<Post>) {
    const { exists, selectFrom } = expressionBuilder<DB, never>();

    return exists(
      selectFrom("posts")
        .whereRef("posts.id", "=", postId)
        .where((eb) => {
          const filters: Expression<SqlBool>[] = [];

          if (criteria) {
            if (criteria.title) {
              filters.push(eb("posts.title", "=", criteria.title));
            }
          }

          return eb.and(filters);
        })
        .select(sql<number>`1`.as("1"))
    );
  }

  protected user(userId: Expression<number>) {
    return jsonObjectFrom(
      this.getDB()
        .selectFrom("users")
        .whereRef("users.id", "=", userId)
        .selectAll("users")
    );
  }

  protected post(postId: Expression<number>) {
    return jsonObjectFrom(
      this.getDB()
        .selectFrom("posts")
        .whereRef("posts.id", "=", postId)
        .selectAll("posts")
    );
  }
}
