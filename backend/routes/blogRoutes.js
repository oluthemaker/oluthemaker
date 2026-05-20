import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  searchBlogs,
  deleteBlog,
  updateBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, admin, createBlog);
router.get("/search", searchBlogs);
router.route("/:slug").get(getBlogBySlug).delete(protect, admin, deleteBlog);
router.route("/:id").put(protect, admin, updateBlog);

export default router;
