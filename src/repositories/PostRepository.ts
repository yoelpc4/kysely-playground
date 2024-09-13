import { Expression, expressionBuilder, sql, SqlBool } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import DatabaseRepository from "@/repositories/DatabaseRepository";
import { InsertablePost, Tag, UpdateablePost, User } from "@/types/models";
import { DB } from "@/types/db";
import {
  GetPostsCriteria,
  GetPostsParams,
  GetPostsIncludes,
} from "@/repositories/PostRepository.types";

export * from "@/repositories/PostRepository.types";

export default class PostRepository extends DatabaseRepository {
  getPosts({
    page,
    pageSize,
    criteria = {},
    includes = [],
    sorts = [],
  }: GetPostsParams) {
    let query = this.getDB()
      .selectFrom("posts")
      .innerJoin("users as authors", "authors.id", "posts.authorId")
      .where((eb) => {
        const filters: Expression<SqlBool>[] = [];

        if (criteria.id) {
          filters.push(eb("posts.id", "=", criteria.id));
        }

        if (criteria.authorId) {
          filters.push(eb("posts.authorId", "=", criteria.authorId));
        }

        if (criteria.title) {
          filters.push(eb("posts.title", "=", criteria.title));
        }

        if (criteria.hasAuthor) {
          filters.push(this.hasAuthor(eb.ref("posts.authorId")));
        } else if (criteria.author) {
          filters.push(
            this.hasAuthor(eb.ref("posts.authorId"), criteria.author)
          );
        }

        if (criteria.hasTags) {
          filters.push(this.hasTags(eb.ref("posts.id")));
        } else if (criteria.tags) {
          filters.push(this.hasTags(eb.ref("posts.id"), criteria.tags));
        }

        return eb.and(filters);
      })
      .selectAll("posts")
      .$if(includes.includes("author"), (qb) =>
        qb.select((eb) => this.author(eb.ref("posts.authorId")).as("author"))
      )
      .$if(includes.includes("tags"), (qb) =>
        qb.select((eb) => this.tags(eb.ref("posts.id")).as("tags"))
      )
      .limit(pageSize)
      .offset(this.getOffset(page, pageSize));

    if (!sorts) {
      query = query.orderBy("posts.id asc");
    } else {
      for (const sort of sorts) {
        switch (sort) {
          case "id":
            query = query.orderBy("posts.id asc");
            break;
          case "-id":
            query = query.orderBy("posts.id desc");
            break;
          case "title":
            query = query.orderBy("posts.title asc");
            break;
          case "-title":
            query = query.orderBy("posts.title desc");
            break;
          case "createdAt":
            query = query.orderBy("posts.createdAt asc");
            break;
          case "-createdAt":
            query = query.orderBy("posts.createdAt desc");
            break;
          case "author.name":
            query = query.orderBy("authors.name asc");
            break;
          case "-author.name":
            query = query.orderBy("authors.name desc");
            break;
        }
      }
    }

    return query.execute();
  }

  async getTotalPosts(criteria: GetPostsCriteria = {}) {
    const [{ total }] = await this.getDB()
      .selectFrom("posts")
      .innerJoin("users as authors", "authors.id", "posts.authorId")
      .where((eb) => {
        const filters: Expression<SqlBool>[] = [];

        if (criteria.id) {
          filters.push(eb("posts.id", "=", criteria.id));
        }

        if (criteria.authorId) {
          filters.push(eb("posts.authorId", "=", criteria.authorId));
        }

        if (criteria.title) {
          filters.push(eb("posts.title", "=", criteria.title));
        }

        if (criteria.hasAuthor) {
          filters.push(this.hasAuthor(eb.ref("posts.authorId")));
        } else if (criteria.author) {
          filters.push(
            this.hasAuthor(eb.ref("posts.authorId"), criteria.author)
          );
        }

        if (criteria.hasTags) {
          filters.push(this.hasTags(eb.ref("posts.id")));
        } else if (criteria.tags) {
          filters.push(this.hasTags(eb.ref("posts.id"), criteria.tags));
        }

        return eb.and(filters);
      })
      .select(sql<number>`COUNT(*)`.as("total"))
      .execute();

    return +total;
  }

  findPost(id: number, includes: GetPostsIncludes = []) {
    return this.getDB()
      .selectFrom("posts")
      .where("posts.id", "=", id)
      .selectAll("posts")
      .$if(includes.includes("author"), (qb) =>
        qb.select((eb) => this.author(eb.ref("posts.authorId")).as("author"))
      )
      .$if(includes.includes("tags"), (qb) =>
        qb.select((eb) => this.tags(eb.ref("posts.id")).as("tags"))
      )
      .executeTakeFirst();
  }

  createPost(data: InsertablePost) {
    return this.getDB()
      .insertInto("posts")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  updatePost(id: number, data: UpdateablePost) {
    return this.getDB()
      .updateTable("posts")
      .set(data)
      .where("posts.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deletePost(id: number) {
    await this.getDB()
      .deleteFrom("posts")
      .where("posts.id", "=", id)
      .executeTakeFirstOrThrow();
  }

  protected author(authorId: Expression<number>) {
    const { selectFrom } = expressionBuilder<DB, never>();

    return jsonObjectFrom(
      selectFrom("users as authors")
        .whereRef("authors.id", "=", authorId)
        .selectAll("authors")
    );
  }

  protected hasAuthor(authorId: Expression<number>, criteria?: Partial<User>) {
    const { exists, selectFrom } = expressionBuilder<DB, never>();

    return exists(
      selectFrom("users as authors")
        .whereRef("authors.id", "=", authorId)
        .where((eb) => {
          const filters: Expression<SqlBool>[] = [];

          if (criteria) {
            if (criteria.email) {
              filters.push(eb("authors.email", "=", criteria.email));
            }

            if (criteria.name) {
              filters.push(eb("authors.name", "=", criteria.name));
            }
          }

          return eb.and(filters);
        })
        .select(sql<number>`1`.as("1"))
    );
  }

  protected tags(postId: Expression<number>) {
    const { selectFrom } = expressionBuilder<DB, never>();

    return jsonArrayFrom(
      selectFrom("tags")
        .innerJoin("postTags", (join) =>
          join
            .onRef("postTags.tagId", "=", "tags.id")
            .onRef("postTags.postId", "=", postId)
        )
        .selectAll("tags")
    );
  }

  protected hasTags(postId: Expression<number>, criteria?: Partial<Tag>) {
    const { exists, selectFrom } = expressionBuilder<DB, never>();

    return exists(
      selectFrom("tags")
        .innerJoin("postTags", (join) =>
          join
            .onRef("postTags.tagId", "=", "tags.id")
            .onRef("postTags.postId", "=", postId)
        )
        .where((eb) => {
          const filters: Expression<SqlBool>[] = [];

          if (criteria) {
            if (criteria.name) {
              filters.push(eb("tags.name", "=", criteria.name));
            }
          }

          return eb.and(filters);
        })
        .select(sql<number>`1`.as("1"))
    );
  }
}
