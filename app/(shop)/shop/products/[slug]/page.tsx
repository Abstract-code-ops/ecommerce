import { 
    getProductBySlug, 
    getRelatedProductsByCategory 
} from "@/lib/actions/product.actions";
import { cache } from 'react';
import ProductClientPage from "@/components/layout/shop/product-client-page";

// Revalidate product pages every 5 minutes
export const revalidate = 300;

// Cache wrapper so `getProductBySlug` is only called once per render
const cachedGetProductBySlug = cache(async (slug: string) => {
    return await getProductBySlug(slug);
});

// Metadata remains here (Server Side) for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const product = await cachedGetProductBySlug(slug)
    
    if (!product) return { title: 'Product not found' }
    
    return {
        title: product.name,
        description: product.description
    }
}

export default async function ProductDetails({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string; color?: string; size?: string }>
}) {
    const { slug } = await params;
    const { page } = await searchParams;

    // Fetch product first to get category for related products (uses cached wrapper)
    const product = await cachedGetProductBySlug(slug);

    if (!product) return <div>Product not found</div>;

    // Fetch related products (could be parallelized if we had category upfront)
    const relatedProducts = await getRelatedProductsByCategory({
        category: product.category,
        productId: product._id.toString(),
        limit: 4,
        page: Number(page) || 1
    });

    // Render the Client Component and pass data as props
    return (
        <ProductClientPage product={product} relatedProducts={relatedProducts.data}/>
    );
}