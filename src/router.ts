import { Router } from "express";
import {
  createUser,
  deleteUser,
  findUser,
  getUsers,
  updateUser,
} from "@/controllers/userController";
import {
  createPost,
  deletePost,
  findPost,
  getPosts,
  updatePost,
} from "@/controllers/postController";
import {
  createTag,
  deleteTag,
  findTag,
  getTags,
  updateTag,
} from "@/controllers/tagController";
import {
  createComment,
  getComments,
  findComment,
  updateComment,
  deleteComment,
} from "@/controllers/commentController";

const router = Router();

router.get("/users", getUsers);
router.get("/users/:id", findUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/posts", getPosts);
router.get("/posts/:id", findPost);
router.post("/posts", createPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

router.get("/tags", getTags);
router.get("/tags/:id", findTag);
router.post("/tags", createTag);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

router.get("/comments", getComments);
router.post("/comments", createComment);
router.get("/comment/:id", findComment);
router.put("/comment/:id", updateComment);
router.delete("/comment/:id", deleteComment);

export default router;
