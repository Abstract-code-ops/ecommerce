'use client'

import { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis"; // Note: removed /types to import the actual class
import ProductGallery from "@/components/layout/shop/product-gallery";
import ProductDetailsInfo from "@/components/layout/shop/product-details";
import { IProduct } from "@/lib/db/models/product.model"; // Ensure you have this type imported

interface ProductClientPageProps {
    product: IProduct;
    // Add relatedProducts here if you plan to use them in the UI later
}

export default function ProductClientPage({ product }: ProductClientPageProps) {
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
        </div>
    );
}