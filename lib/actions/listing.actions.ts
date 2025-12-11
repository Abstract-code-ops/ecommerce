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

export async function getFilterOptions(): Promise<FilterOptions> {
  await connectToDB();

  const products = await Product.find({ isPublished: true });

  if (products.length === 0) {
    return {
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
  }

  const categories = [...new Set(products.map(p => p.category))];
  
  const prices = products.map(p => p.price);
  const widths = products.map(p => p.dimensions?.width ?? 0);
  const heights = products.map(p => p.dimensions?.height ?? 0);
  const depths = products.map(p => p.dimensions?.depth ?? 0);
  const reviews = products.map(p => p.numReviews ?? 0);
  const ratings = products.map(p => p.avgRating ?? 0);

  return {
    categories,
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    dimensionsRange: {
      width: { min: Math.min(...widths), max: Math.max(...widths) },
      height: { min: Math.min(...heights), max: Math.max(...heights) },
      depth: { min: Math.min(...depths), max: Math.max(...depths) },
    },
    reviewsRange: { min: Math.min(...reviews), max: Math.max(...reviews) },
    ratingRange: { min: Math.min(...ratings), max: Math.max(...ratings) },
  };
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

  if (category) {
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
    conditions.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Build sort options
  let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
  
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
      sortOptions = { createdAt: -1 };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    Product.find(conditions)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(conditions),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
