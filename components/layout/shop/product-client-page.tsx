'use client'

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import ProductGallery from "@/components/layout/shop/product-gallery";
import ProductDetailsInfo from "@/components/layout/shop/product-details";
import { IProduct } from "@/lib/db/models/product.model";
import ProductSlider from "./product-slider";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import AddToBrowsingHistory from "@/components/shared/add-to-browsing-history";

interface ProductClientPageProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductClientPage({ product, relatedProducts }: ProductClientPageProps) {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        // Skip smooth scroll if user prefers reduced motion
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenisInstance;

        function loop(time: number) {
            try {
                if (lenisRef.current && typeof (lenisRef.current as any).raf === 'function') {
                    lenisRef.current.raf(time);
                }
            } catch (err) {
                // swallow errors
            }
            rafRef.current = requestAnimationFrame(loop);
        }

        // Pause on visibility change to save CPU
        const handleVisibilityChange = () => {
            if (document.hidden) {
                lenisRef.current?.stop();
            } else {
                lenisRef.current?.start();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            try {
                lenisInstance.destroy();
            } catch (e) {
                // ignore destroy errors
            }
            lenisRef.current = null;
        };
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