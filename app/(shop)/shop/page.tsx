import ProductSlider from "@/components/layout/shop/product-slider"
import { ProductCard } from "@/components/layout/shop/shop-card"
import { ShopCarousel } from "@/components/layout/shop/shop-carousel"
import BrowsingHistoryList from "@/components/shared/browsing-history-list"
import { getProductByTag, getFeaturedProducts } from "@/lib/actions/product.actions"
import data from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

// Increase revalidation time for better caching (5 minutes)
export const revalidate = 300;

// Define categories for navigation with images
const categories = [
    { 
        name: "Paperbags", 
        href: "/shop/products?category=Paperbags", 
        description: "Eco-friendly paper bags", 
        image: "/images/casual-teenager-checking-her-shopping-bags.jpg"
    },
    { 
        name: "Gift Boxes", 
        href: "/shop/products?category=Gift+Boxes", 
        description: "Premium gift packaging", 
        image: "/images/composition-wrapped-gifts-cement-background.jpg"
    },
    { 
        name: "Plastic Bags", 
        href: "/shop/products?category=Plastic+Bags", 
        description: "Durable plastic options", 
        image: "/images/anna-szentgyorgyi-bWMp9C3DFYE-unsplash.jpg"
    },
]

export default async function Page() {
    // Fetch data inside the component to ensure fresh data on each request
    const [bestSelling, todayDeals, featuredProducts] = await Promise.all([
        getProductByTag({tag: 'best-seller'}),
        getProductByTag({tag: 'today-deal'}),
        getFeaturedProducts(8)
    ]);

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-8">
            <ShopCarousel items={data.carousels} />
            
            {/* Category Cards Section */}
            <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-foreground/90">Shop by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {categories.map((cat, index) => (
                        <Link 
                            key={cat.name} 
                            href={cat.href}
                            className="group relative overflow-hidden rounded-xl aspect-4/3 md:aspect-square"
                        >
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        priority={index === 0}
                                        unoptimized
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-end p-5 md:p-6">
                                <div className="transform transition-all duration-300 group-hover:translate-y-2">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
                                        {cat.name}
                                    </h3>
                                    <p className="text-sm text-white/80 mb-3 transition-all duration-300 group-hover:text-white">
                                        {cat.description}
                                    </p>
                                    
                                    {/* Arrow Button */}
                                    <div className="inline-flex items-center gap-2 text-white text-sm font-medium">
                                        <span className="transition-all duration-300 group-hover:translate-x-1">Shop Now</span>
                                        <svg 
                                            className="w-4 h-4 transition-all duration-300 group-hover:translate-x-2" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Animated Border Effect */}
                                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-all duration-300" />
                            </div>

                            {/* Shimmer Effect on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-linear-to-r from-transparent via-white/10 to-transparent" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Product Sections */}
            <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
                {/* Latest Products */}
                <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
                    <ProductSlider 
                        title="Latest Products" 
                        subTitle="See what's new in our collection" 
                        products={todayDeals} 
                        showBottom
                    />
                </div>

                {/* Best Sellers */}
                <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
                    <ProductSlider 
                        title="Best Sellers" 
                        subTitle="Our most popular products" 
                        products={bestSelling} 
                        showBottom
                    />
                </div>

                {/* Featured Products Grid */}
                <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-foreground/90">Featured Products</h2>
                            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Handpicked selections for you</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 hover:bg-primary/5">
                            <Link href="/shop/products">View All →</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 space-y-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Browsing History - Lazy loaded since it's below the fold */}
            <Suspense fallback={<div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full h-48" />}>
                <section id="browsing-history" className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <BrowsingHistoryList />
                </section>
            </Suspense>
        </div>
    )
}