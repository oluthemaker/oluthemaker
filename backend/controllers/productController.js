import Product from "../models/productModel.js";
import slugify from "slugify"; // Tip: npm install slugify
import Blog from "../models/blogModel.js";

// @desc    Fetch all products (with optional filtering)
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, type } = req.query;
    let query = {};

    if (category) query.category = category;
    if (type) query["shoeDetails.type"] = type; // e.g., RTW vs Commission

    const products = await Product.find(query).populate(
      "magazineDetails.articles",
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      subCategory,
      isAuction,
      auctionDetails,
      images,
      shoeDetails,
      magazineDetails,
      stock,
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const productData = {
      name,
      price,
      slug,
      description,
      category,
      subCategory: subCategory || null,
      images,
      stock: isAuction ? 1 : stock,
      status: isAuction ? "Auction" : "Available",
      isAuction: Boolean(isAuction),
      admin: req.user._id,
    };

    if (category === "Shoe") productData.shoeDetails = shoeDetails;
    if (category === "Magazine") productData.magazineDetails = magazineDetails;

    if (isAuction && auctionDetails) {
      productData.auctionDetails = {
        startingBid: Number(auctionDetails.startingBid || price),
        currentBid: Number(auctionDetails.startingBid || price),
        minBidIncrement: Number(auctionDetails.minBidIncrement || 5000),
        startTime: new Date(auctionDetails.startTime),
        endTime: new Date(auctionDetails.endTime),
        reservePrice: auctionDetails.reservePrice ? Number(auctionDetails.reservePrice) : undefined,
      };
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
