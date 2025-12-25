'use server'
import { connectToDB } from "../db";
import Product, { IProduct } from "../db/models/product.model";

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

// Helper to serialize Mongoose documents to plain objects (handles ObjectId, Date, etc.)
function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

export async function getProductByTag({
    tag,
    limit = 10,
}:{
    tag: string;
    limit?: number;
}) {
    await connectToDB();
    const products = await Product.find({
        tags: { $in: [tag] },
        isPublished: true,
    }, listProjection)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    return serialize(products) as IProduct[];
}

// Get product by slug (full document for detail page)
export async function getProductBySlug(slug: string) {
    await connectToDB();
    const product = await Product.findOne({ slug, isPublished: true }).lean();
    return product ? serialize(product) as IProduct : null;
}

// Get Related products
export async function getRelatedProductsByCategory({
    category,
    productId,
    limit = 10,
    page = 1
}:{
    category: string;
    productId: string;
    limit?: number;
    page?: number;
}) {
    await connectToDB();
    const skipAmount = (page - 1) * limit;
    const conditions = {
        isPublished: true,
        category,
        _id: { $ne: productId }
    };
    
    // Parallel fetch for products and count
    const [products, productsCount] = await Promise.all([
        Product.find(conditions, listProjection)
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(limit)
            .lean(),
        Product.countDocuments(conditions)
    ]);

    return {
        data: serialize(products) as IProduct[],
        totalPages: Math.ceil(productsCount / limit)
    };
}

// Get featured products
export async function getFeaturedProducts(limit: number = 8) {
    await connectToDB();
    const products = await Product.find({ isPublished: true }, listProjection)
        .sort({ numSales: -1 })
        .limit(limit)
        .lean();
    return serialize(products) as IProduct[];
}

/**
 * Get current stock for a product by ID
 * Used for real-time stock validation before adding to cart
 */
export async function getProductStock(productId: string): Promise<{
  success: boolean
  stock?: number
  error?: string
}> {
  try {
    await connectToDB()
    
    const product = await Product.findById(productId).select('countInStock').lean()
    
    if (!product) {
      return { success: false, error: 'Product not found' }
    }
    
    return { 
      success: true, 
      stock: (product as { countInStock?: number }).countInStock ?? 0 
    }
  } catch (error) {
    console.error('Error fetching product stock:', error)
    return { success: false, error: 'Failed to fetch stock' }
  }
}

// Get search suggestions (lightweight for autocomplete)
export async function getSearchSuggestions(query: string) {
    await connectToDB();
    
    if (!query) return [];

    const products = await Product.find({
        isPublished: true,
        $text: { $search: query }
    }, {
        name: 1,
        slug: 1,
        price: 1,
        images: { $slice: 1 },
        category: 1
    })
    .sort({ score: { $meta: "textScore" } })
    .limit(5)
    .lean();

    return serialize(products) as IProduct[];
}