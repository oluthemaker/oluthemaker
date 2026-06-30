import Blog from "../models/blogModel.js";
import Product from "../models/productModel.js";

// @desc    Create a blog post
export const createBlog = async (req, res) => {
  try {
    // 1. Create the blog entry
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();

    console.log(req.body);

    // 2. Check if a magazine issue number was provided
    if (req.body.magazineIssue) {
      // Find the magazine product by category and issue number
      // We use a regex or parseInt to ensure the match is robust
      const magazine = await Product.findOne({
        category: "Magazine",
        "magazineDetails.issueNumber": parseInt(req.body.magazineIssue),
      });

      if (magazine) {
        // Add the blog ID to the magazine's articles array
        magazine.magazineDetails.articles.push(savedBlog._id);
        await magazine.save();
      }
    }

    res.status(201).json({ success: true, data: savedBlog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all blogs with pagination
// @desc    Get all blogs with pagination and category filtering
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    // 1. ALWAYS fetch the main featured article, but ensure it is published
    const featuredBlog = await Blog.findOne({
      featured: true,
      status: "published",
    })
      .populate("magazineRef", "name slug images")
      .sort({ publishedAt: -1 });

    // 2. Build the query object (ONLY query published articles)
    let query = { status: "published" };

    if (category) {
      query.category = category;
    }

    if (featuredBlog) {
      query._id = { $ne: featuredBlog._id };
    }

    // 3. Fetch the filtered/paginated articles
    const blogs = await Blog.find(query)
      .populate("magazineRef", "name slug images")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      featured: featuredBlog,
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDrafts = async (req, res) => {
  try {
    // Fetch all articles where status is draft, sorted by newest first
    const drafts = await Blog.find({ status: "draft" }).sort({ updatedAt: -1 });
    res.json({ blogs: drafts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get single blog & increment views
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true },
    ).populate("magazineRef");

    if (!blog) return res.status(404).json({ error: "Post not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Search blogs
export const searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).limit(10);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, message: "Archive entry removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update a blog post
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // If this post is being set to featured, unset all others first.
    if (req.body.featured === true) {
      await Blog.updateMany(
        { _id: { $ne: blog._id } },
        { $set: { featured: false } },
      );
    }

    // Update fields
    Object.assign(blog, req.body);

    // If title changed, you might want to re-slugify here if not handled by frontend
    const updatedBlog = await blog.save();

    // Sync with Magazine if issue is provided
    if (req.body.magazineIssue) {
      const magazine = await Product.findOne({
        category: "Magazine",
        "magazineDetails.issueNumber": parseInt(req.body.magazineIssue),
      });

      if (
        magazine &&
        !magazine.magazineDetails.articles.includes(updatedBlog._id)
      ) {
        magazine.magazineDetails.articles.push(updatedBlog._id);
        await magazine.save();
      }
    }

    res.json({ success: true, data: updatedBlog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
