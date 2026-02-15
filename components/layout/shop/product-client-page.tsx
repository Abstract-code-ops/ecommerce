'use client'

import ProductGallery from "@/components/layout/shop/product-gallery";
import ProductDetailsInfo from "@/components/layout/shop/product-details";
import { IProduct } from "@/lib/db/models/product.model";
import ProductSlider from "./product-slider";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import AddToBrowsingHistory from "@/components/shared/add-to-browsing-history";
import ReviewStats from "@/components/shared/review-stats";
import ReviewList from "@/components/shared/review-list";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ReviewStats as ReviewStatsType } from "@/lib/actions/review.actions";

interface ProductClientPageProps {
    product: IProduct;
    relatedProducts: IProduct[];
    reviewStats?: ReviewStatsType;
}

export default function ProductClientPage({ product, relatedProducts, reviewStats }: ProductClientPageProps) {
    const { user } = useAuth();

    return (
        <div className="bg-background">
            <AddToBrowsingHistory id={product._id.toString()} category={product.category} />
            <section className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* LEFT: Gallery */}
                <div className="lg:col-span-7 xl:col-span-8 relative bg-muted/30">
                    <ProductGallery images={product.images}/>
                </div>

                {/* RIGHT: Details */}
                <div className="lg:col-span-5 xl:col-span-4 px-6 py-8 lg:px-10 lg:py-16 relative bg-background">
                    <div className="lg:sticky lg:top-24 max-w-lg mx-auto lg:mx-0">
                        <ProductDetailsInfo product={product} reviewStats={reviewStats} />
                    </div>
                </div>
            </section>
            
            {/* Reviews Section */}
            <section className="py-16 md:py-24 bg-background border-t border-border">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
                    {/* Review Stats */}
                    {reviewStats && (
                        <div className="mb-12">
                            <ReviewStats
                                average={reviewStats.average}
                                count={reviewStats.count}
                                distribution={reviewStats.distribution}
                            />
                        </div>
                    )}
                    
                    {/* Review List */}
                    <ReviewList
                        productId={product._id.toString()}
                        productName={product.name}
                        currentUserId={user?.id}
                    />
                </div>
            </section>
            
            {/* Related Products Section */}
            <section className="py-16 md:py-24 bg-card border-t border-border">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                    <ProductSlider
                        title="You May Also Like"
                        products={relatedProducts}
                        showBottom={true}
                    />
                </div>
            </section>
            
            {/* Browsing History */}
            <section className="py-16 md:py-24 bg-background">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                    <BrowsingHistoryList className="" />
                </div>
            </section>
        </div>
    );
}