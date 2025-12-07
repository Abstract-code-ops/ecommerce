import { 
    getProductBySlug, 
    getRelatedProductsByCategory 
} from "@/lib/actions/product.actions";
import ProductClientPage from "@/components/layout/shop/product-client-page";

// Metadata remains here (Server Side) for SEO
export async function generateMetadata(props:{
    params: Promise<{ slug: string }>
}) {
    const params = await props.params
    const product = await getProductBySlug(params.slug)
    
    if (!product) return { title: 'Product not found' }
    
    return {
        title: product.name,
        description: product.description
    }
}

export default async function ProductDetails(props:{
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page: string; color: string; size: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { page } = searchParams;

    // 1. Fetch Data on Server
    const product = await getProductBySlug(params.slug);
    console.log(product)

    if (!product) return <div>Product not found</div>;

    // (Optional) Fetch related products if you plan to pass them down
    const relatedProducts = await getRelatedProductsByCategory({
        category: product.category,
        productIDd: product._id.toString(),
        limit: 4,
        page: Number(page) || 1
    });

    // 2. Render the Client Component and pass data as props
    return (
        <ProductClientPage product={product} />
    );
}