'use client'

import { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis"; // Note: removed /types to import the actual class
import ProductGallery from "@/components/layout/shop/product-gallery";
import ProductDetailsInfo from "@/components/layout/shop/product-details";
import { IProduct } from "@/lib/db/models/product.model"; // Ensure you have this type imported
import ProductSlider from "./product-slider";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import AddToBrowsingHistory from "@/components/shared/add-to-browsing-history";

interface ProductClientPageProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductClientPage({ product, relatedProducts }: ProductClientPageProps) {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        setLenis(lenisInstance);

        function raf(time: number) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenisInstance.destroy();
        }
    }, []);

    return (
        <div className="">
            <AddToBrowsingHistory id={product._id.toString()} category={product.category} />
            <section className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* LEFT: Gallery */}
                <div className="lg:col-span-7 xl:col-span-8 relative">
                    <ProductGallery images={product.images}/>
                </div>

                {/* RIGHT: Details */}
                <div className="lg:col-span-5 xl:col-span-4 pr-6 py-8 lg:pr-12 lg:py-16 relative">
                    <div className="lg:sticky lg:top-24">
                        <ProductDetailsInfo product={product} />
                    </div>
                </div>
            </section>
            <section className="mt-20">
                <ProductSlider
                    title="Related Products"
                    products={relatedProducts}
                    showBottom={true}
                />
            </section>
            <div className="">
                <BrowsingHistoryList className="mt-10" />
            </div>
        </div>
    );
}