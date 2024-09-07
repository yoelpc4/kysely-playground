import { RequestHandler } from "express";
import { CommentService } from "@/services/CommentService";

export const getComments: RequestHandler = async (req, res, next) => {
  const commentService = new CommentService();

  try {
    const paginatedComments = await commentService.getComments(req.query);

    res.status(200).json(paginatedComments);
  } catch (error) {
    next(error);
  }
};

export const createComment: RequestHandler = async (req, res, next) => {
  const commentService = new CommentService();

  try {
    const comment = await commentService.createComment(req.body);

    res.status(201).json({
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const findComment: RequestHandler = async (req, res, next) => {
  const commentService = new CommentService();

  try {
    const comment = await commentService.findComment(+req.params.id);

    if (!comment) {
      return res.status(404).send();
    }

    res.status(200).json({
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment: RequestHandler = async (req, res, next) => {
  const commentService = new CommentService();

  try {
    const comment = await commentService.findComment(+req.params.id);

    if (!comment) {
      return res.status(404).send();
    }

    const updatedComment = await commentService.updateComment(
      comment.id,
      req.body
    );

    res.status(200).json({
      comment: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  const commentService = new CommentService();

  try {
    const comment = await commentService.findComment(+req.params.id);

    if (!comment) {
      return res.status(404).send();
    }

    await commentService.deleteComment(comment.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
