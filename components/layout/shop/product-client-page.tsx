'use client'

import { useEffect, useState, useRef } from "react";
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
    const rafRef = useRef<number | null>(null); // <-- track RAF id

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

        // use a named function for RAF so we can cancel it reliably
        function loop(time: number) {
            try {
                // only call raf if lenisInstance still exists
                if (lenisInstance && typeof (lenisInstance as any).raf === 'function') {
                    lenisInstance.raf(time);
                }
            } catch (err) {
                // swallow errors to avoid propagation to extensions/devtools
                // (keeps runtime stable if lenisInstance was destroyed)
                // console.debug('lenis raf error', err);
            }
            rafRef.current = requestAnimationFrame(loop);
        }

        // start RAF loop and keep id in ref
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            // cancel RAF loop on unmount
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            // destroy Lenis instance
            try {
                lenisInstance.destroy();
            } catch (e) {
                // ignore destroy errors
            }
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