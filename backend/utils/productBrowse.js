const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const parseBrowseParams = (params = {}) => {
  const requestedPage = Number.parseInt(params.page, 10);
  const requestedLimit = Number.parseInt(params.limit, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 48) : 12;
  const minPrice = parseOptionalNumber(params.minPrice);
  const maxPrice = parseOptionalNumber(params.maxPrice);
  return {
    page,
    limit,
    search: String(params.search || "").trim().slice(0, 100),
    category: String(params.category || "").trim().slice(0, 60),
    subCategory: String(params.subCategory || "").trim().slice(0, 80),
    color: String(params.color || "").trim().slice(0, 60),
    size: String(params.size || "").trim().slice(0, 30),
    minPrice,
    maxPrice,
    sort: ["standard", "newest", "price_asc", "price_desc"].includes(params.sort) ? params.sort : "standard",
  };
};

export const buildPublicBrowseQuery = (filters) => {
  const clauses = [
    { $or: [{ publicationStatus: "Published" }, { publicationStatus: { $exists: false } }] },
    { status: { $ne: "Archived" } },
  ];
  if (filters.category) clauses.push({ category: filters.category });
  if (filters.subCategory) clauses.push({ subCategory: filters.subCategory });
  if (filters.search) {
    const pattern = new RegExp(escapeRegex(filters.search), "i");
    clauses.push({ $or: [
      { name: pattern }, { description: pattern }, { category: pattern }, { subCategory: pattern },
      { "shoeDetails.style": pattern }, { "shoeDetails.material": pattern }, { "shoeDetails.color": pattern },
      { "variants.color": pattern }, { "variants.size": pattern },
    ] });
  }
  if (filters.color) {
    clauses.push({ $or: [
      { "shoeDetails.color": { $regex: `^${escapeRegex(filters.color)}$`, $options: "i" } },
      { "variants.color": { $regex: `^${escapeRegex(filters.color)}$`, $options: "i" } },
    ] });
  }
  if (filters.size) {
    const numericSize = Number(filters.size);
    const sizeMatches = Number.isFinite(numericSize)
      ? [{ "shoeDetails.sizes": numericSize }, { "variants.size": filters.size }, { "variants.size": String(numericSize) }]
      : [{ "variants.size": filters.size }];
    clauses.push({ $or: sizeMatches });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const range = {};
    if (filters.minPrice !== null) range.$gte = filters.minPrice;
    if (filters.maxPrice !== null) range.$lte = filters.maxPrice;
    clauses.push({ $or: [{ price: range }, { variants: { $elemMatch: { isActive: { $ne: false }, price: range } } }] });
  }
  return { $and: clauses };
};

export const getBrowseSort = (sort) => {
  if (sort === "newest") return { createdAt: -1, _id: -1 };
  if (sort === "price_asc") return { price: 1, _id: 1 };
  if (sort === "price_desc") return { price: -1, _id: -1 };
  return { createdAt: -1, _id: -1 };
};
