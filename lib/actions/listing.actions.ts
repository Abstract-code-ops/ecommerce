'use server'

import { connectToDB } from "../db";
import Product, { IProduct } from "../db/models/product.model";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minDepth?: number;
  maxDepth?: number;
  minReviews?: number;
  maxReviews?: number;
  minRating?: number;
  maxRating?: number;
  deals?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  dimensionsRange: {
    width: { min: number; max: number };
    height: { min: number; max: number };
    depth: { min: number; max: number };
  };
  reviewsRange: { min: number; max: number };
  ratingRange: { min: number; max: number };
}

// In-memory cache for filter options (10 minute TTL)
let filterOptionsCache: { data: FilterOptions; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const defaultFilterOptions: FilterOptions = {
  categories: [],
  priceRange: { min: 0, max: 1000 },
  dimensionsRange: {
    width: { min: 0, max: 100 },
    height: { min: 0, max: 100 },
    depth: { min: 0, max: 100 },
  },
  reviewsRange: { min: 0, max: 1000 },
  ratingRange: { min: 0, max: 5 },
};

export async function getFilterOptions(): Promise<FilterOptions> {
  // Return cached result if still valid
  if (filterOptionsCache && Date.now() - filterOptionsCache.timestamp < CACHE_TTL_MS) {
    return filterOptionsCache.data;
  }

  await connectToDB();

  // Use MongoDB aggregation instead of fetching all documents
  const [aggregationResult] = await Product.aggregate([
    { $match: { isPublished: true } },
    {
      $group: {
        _id: null,
        categories: { $addToSet: '$category' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        minWidth: { $min: '$dimensions.width' },
        maxWidth: { $max: '$dimensions.width' },
        minHeight: { $min: '$dimensions.height' },
        maxHeight: { $max: '$dimensions.height' },
        minDepth: { $min: '$dimensions.depth' },
        maxDepth: { $max: '$dimensions.depth' },
        minReviews: { $min: '$numReviews' },
        maxReviews: { $max: '$numReviews' },
        minRating: { $min: '$avgRating' },
        maxRating: { $max: '$avgRating' },
      },
    },
  ]);

  if (!aggregationResult) {
    return defaultFilterOptions;
  }

  const result: FilterOptions = {
    categories: aggregationResult.categories || [],
    priceRange: {
      min: aggregationResult.minPrice ?? 0,
      max: aggregationResult.maxPrice ?? 1000,
    },
    dimensionsRange: {
      width: {
        min: aggregationResult.minWidth ?? 0,
        max: aggregationResult.maxWidth ?? 100,
      },
      height: {
        min: aggregationResult.minHeight ?? 0,
        max: aggregationResult.maxHeight ?? 100,
      },
      depth: {
        min: aggregationResult.minDepth ?? 0,
        max: aggregationResult.maxDepth ?? 100,
      },
    },
    reviewsRange: {
      min: aggregationResult.minReviews ?? 0,
      max: aggregationResult.maxReviews ?? 1000,
    },
    ratingRange: {
      min: aggregationResult.minRating ?? 0,
      max: aggregationResult.maxRating ?? 5,
    },
  };

  // Cache the result
  filterOptionsCache = { data: result, timestamp: Date.now() };

  return result;
}

export async function getFilteredProducts(filters: ProductFilters): Promise<{
  products: IProduct[];
  totalCount: number;
  totalPages: number;
}> {
  await connectToDB();

  const {
    category,
    minPrice,
    maxPrice,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    minDepth,
    maxDepth,
    minReviews,
    maxReviews,
    minRating,
    maxRating,
    deals,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = filters;

  // Build query conditions
  const conditions: Record<string, unknown> = { isPublished: true };

  if (category && category !== 'all') {
    conditions.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    conditions.price = {};
    if (minPrice !== undefined) (conditions.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (conditions.price as Record<string, number>).$lte = maxPrice;
  }

  if (minWidth !== undefined || maxWidth !== undefined) {
    conditions['dimensions.width'] = {};
    if (minWidth !== undefined) (conditions['dimensions.width'] as Record<string, number>).$gte = minWidth;
    if (maxWidth !== undefined) (conditions['dimensions.width'] as Record<string, number>).$lte = maxWidth;
  }

  if (minHeight !== undefined || maxHeight !== undefined) {
    conditions['dimensions.height'] = {};
    if (minHeight !== undefined) (conditions['dimensions.height'] as Record<string, number>).$gte = minHeight;
    if (maxHeight !== undefined) (conditions['dimensions.height'] as Record<string, number>).$lte = maxHeight;
  }

  if (minDepth !== undefined || maxDepth !== undefined) {
    conditions['dimensions.depth'] = {};
    if (minDepth !== undefined) (conditions['dimensions.depth'] as Record<string, number>).$gte = minDepth;
    if (maxDepth !== undefined) (conditions['dimensions.depth'] as Record<string, number>).$lte = maxDepth;
  }

  if (minReviews !== undefined || maxReviews !== undefined) {
    conditions.numReviews = {};
    if (minReviews !== undefined) (conditions.numReviews as Record<string, number>).$gte = minReviews;
    if (maxReviews !== undefined) (conditions.numReviews as Record<string, number>).$lte = maxReviews;
  }

  if (minRating !== undefined || maxRating !== undefined) {
    conditions.avgRating = {};
    if (minRating !== undefined) (conditions.avgRating as Record<string, number>).$gte = minRating;
    if (maxRating !== undefined) (conditions.avgRating as Record<string, number>).$lte = maxRating;
  }

  if (deals) {
    conditions.tags = { $in: ['today-deal', 'deal', 'sale'] };
  }

  if (search) {
    conditions.$text = { $search: search };
  }

  // Build sort options
  let sortOptions: Record<string, any> = { createdAt: -1 };

  if (search) {
    sortOptions = { score: { $meta: "textScore" } };
  }
  
  switch (sort) {
    case 'price-asc':
      sortOptions = { price: 1 };
      break;
    case 'price-desc':
      sortOptions = { price: -1 };
      break;
    case 'rating':
      sortOptions = { avgRating: -1 };
      break;
    case 'reviews':
      sortOptions = { numReviews: -1 };
      break;
    case 'newest':
    default:
      if (!search) {
        sortOptions = { createdAt: -1 };
      }
      break;
  }

  const skip = (page - 1) * limit;

  // Projection for list views (lighter payload)
  const listProjection = {
    name: 1,
    slug: 1,
    price: 1,
    listPrice: 1,
    images: { $slice: 2 },
    avgRating: 1,
    numReviews: 1,
    countInStock: 1,
    category: 1,
    dimensions: 1,
    tags: 1
  };

  const [products, totalCount] = await Promise.all([
    Product.find(conditions, listProjection)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(conditions),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
