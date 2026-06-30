// store/blogStore.js
import { create } from "zustand";
import API from "../api/axios";
import useUserStore from "./useUserStore";

const useBlogStore = create((set) => ({
  blogs: [],
  currentBlog: null,
  featuredBlog: null, // <-- NEW STATE
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,

  // Fetch all blogs and then paginante
  // Fetch all blogs with pagination and optional category filtering
  fetchBlogs: async (page = 1, category = "", limit = 10) => {
    set({ loading: true, error: null });
    try {
      // Build the base URL
      let url = `/blogs?page=${page}&limit=${limit}`;

      // Append category if one is selected (and it isn't "all")
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const { data } = await API.get(url);

      set({
        blogs: data.blogs,
        featuredBlog: data.featured, // <-- CATCH THE FEATURED POST
        currentPage: data.page,
        totalPages: data.pages,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },
  // Add this inside useBlogStore, right below fetchBlogs
  fetchDrafts: async () => {
    set({ loading: true, error: null });
    try {
      // Need token since drafts should be protected
      const token = useUserStore.getState().user?.token;

      const { data } = await API.get(`/blogs/drafts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        blogs: data.blogs,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // Fetch single blog by slug
  fetchBlogBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.get(`/blogs/${slug}`);
      set({ currentBlog: data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // Create new blog
  createBlog: async (blogData, token) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post("/blogs", blogData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        transformRequest: [(data) => JSON.stringify(data)], // Ensure proper JSON
      });

      const newBlog = response.data;

      set((state) => ({
        blogs: [newBlog, ...state.blogs],
        loading: false,
      }));

      return newBlog;
    } catch (err) {
      let errorMessage = "Failed to create blog";

      if (err.response) {
        console.error("Server response:", {
          status: err.response.status,
          data: err.response.data,
        });
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          `Server error: ${err.response.status}`;
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server - check your connection";
      } else {
        console.error("Request setup error:", err.message);
        errorMessage = `Request error: ${err.message}`;
      }

      set({ error: errorMessage, loading: false });
      throw errorMessage;
    }
  },
  // store/blogStore.js
  searchBlogs: async (query) => {
    set({ loading: true, error: null });
    try {
      const { data } = await API.get(
        `/blogs/search?q=${encodeURIComponent(query)}`,
      );
      set({
        blogs: data,
        currentPage: 1,
        totalPages: 1,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // Delete a blog by slug
  deleteBlog: async (slug) => {
    set({ loading: true, error: null });
    try {
      await API.delete(`/blogs/${slug}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      set((state) => ({
        blogs: state.blogs.filter((blog) => blog.slug !== slug),
        loading: false,
      }));

      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },
  // Add this inside useBlogStore
  updateBlog: async (id, blogData) => {
    set({ loading: true, error: null });
    try {
      const token = useUserStore.getState().user?.token;
      const { data } = await API.put(`/blogs/${id}`, blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        blogs: state.blogs.map((b) => (b._id === id ? data.data : b)),
        currentBlog: data.data,
        loading: false,
      }));
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Update failed";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));

export default useBlogStore;
