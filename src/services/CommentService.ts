import {
  CommentRepository,
  GetCommentsCriteria,
} from "@/repositories/CommentRepository";
import {
  CommentRelations,
  InsertableComment,
  UpdateableComment,
} from "@/types/models";
import TransactionalService from "@/services/TransactionalService";

export class CommentService extends TransactionalService {
  private readonly commentRepository = new CommentRepository();

  async getComments(query: Record<string, unknown>) {
    if (!query.page) {
      throw new Error("page is required");
    }

    if (!query.pageSize) {
      throw new Error("page size is required");
    }

    const page = +query.page;

    const pageSize = +query.pageSize;

    const criteria = query.criteria as GetCommentsCriteria | undefined;

    const includes = query.includes as CommentRelations | undefined;

    const comments = await this.commentRepository.getComments({
      page,
      pageSize,
      criteria,
      includes,
    });

    const total = await this.commentRepository.getTotalComments(criteria);

    return {
      comments,
      meta: {
        page,
        pageSize,
        total,
      },
    };
  }

  findComment(id: number) {
    return this.commentRepository.findComment(id);
  }

  createComment(data: InsertableComment) {
    return this.commentRepository.createComment(data);
  }

  updateComment(id: number, data: UpdateableComment) {
    return this.commentRepository.updateComment(id, data);
  }

  async deleteComment(id: number) {
    await this.registerForTransaction(
      this.commentRepository
    ).executeTransaction(async () => {
      await this.commentRepository.deleteComment(id);
    });
  }
}
