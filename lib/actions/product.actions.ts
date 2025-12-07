import { connectToDB } from "../db";
import Product, { IProduct } from "../db/models/product.model";

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
    })
    .sort({ createdAt: 'desc' })
    .limit(limit);
    return JSON.parse(JSON.stringify(products)) as IProduct[]
}

// Get product by slug
export async function getProductBySlug(slug: string) {
    await connectToDB();
    const product = await Product.findOne({ slug, isPublished: true });
    return JSON.parse(JSON.stringify(product)) as IProduct
}

//Get Related products
export async function getRelatedProductsByCategory({
    category,
    productIDd,
    limit = 10,
    page=1
}:{
    category: string;
    productIDd: string;
    limit?: number;
    page?: number;
}) {
    await connectToDB()
    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
        isPublished: true,
        category,
        _id: { $ne: productIDd }
    }
    const products = await Product.find(conditions)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit);

    const productsCount = await Product.countDocuments(conditions)
    return {
        data: JSON.parse(JSON.stringify(products)) as IProduct[],
        totalPages: Math.ceil(productsCount / limit)
    }
}