import ProductSlider from "@/components/layout/shop/product-slider"
import { ProductCard } from "@/components/layout/shop/shop-card"
import HeroCarousel from "@/components/layout/home/hero-carousel"
import HeroSection from "@/components/layout/home/hero-section"
import BrowsingHistoryList from "@/components/shared/browsing-history-list"
import FadeInSection from "@/components/shared/fade-in-section"
import { getProductByTag, getFeaturedProducts } from "@/lib/actions/product.actions"
import { getBanners } from "@/lib/actions/banner.actions"
import { getCategoryImages } from "@/lib/actions/storefront.actions"
import data from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { ArrowRight, Leaf, Truck, RefreshCw, Shield } from "lucide-react"

// Increase revalidation time for better caching (5 minutes)
export const revalidate = 300;

const features = [
    { icon: Leaf, title: "Eco-Friendly", description: "Sustainable materials" },
    { icon: Truck, title: "Free Shipping", description: "On orders over AED 200" },
    { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy" },
    { icon: Shield, title: "Secure Checkout", description: "100% protected" },
]

export default async function Page() {
    const [bestSelling, featuredProducts, newArrivalsA, newArrivalsB, dbBanners, dbCategoryImages] = await Promise.all([
        getProductByTag({tag: 'best-seller'}),
        getFeaturedProducts(),
        getProductByTag({tag: 'new-arrival'}),
        getProductByTag({tag: 'New Arrivals'}),
        getBanners(),
        getCategoryImages()
    ]);

    // Merge products from both tag variants and dedupe by `slug` (fallback to `id`)
    const newArrivals = (() => {
        const map = new Map();
        const listA = Array.isArray(newArrivalsA) ? newArrivalsA : [];
        const listB = Array.isArray(newArrivalsB) ? newArrivalsB : [];
        for (const p of [...listA, ...listB]) {
            if (!p) continue;
            const key = p.slug ?? JSON.stringify(p);
            if (!map.has(key)) map.set(key, p);
        }
        return Array.from(map.values());
    })();

    // Use database category images if available, otherwise fall back to default
    const categories = dbCategoryImages.length > 0 
        ? dbCategoryImages.map(cat => ({
            name: cat.name,
            href: cat.link_url,
            description: cat.description,
            image: cat.image_url
        }))
        : [];

    const carouselItems = dbBanners.length > 0 
        ? dbBanners.map(b => ({
            title: b.title,
            subtitle: b.subtitle,
            imageUrl: b.image_url,
            imageUrlTablet: b.image_url_tablet,
            imageUrlMobile: b.image_url_mobile,
            imagePosition: b.image_position || 'right',
            href: b.link_url || '#',
            buttonCaption: b.button_caption,
            isPublished: b.is_active
        }))
        : data.carousels.map(c => ({
            ...c,
            subtitle: null as string | null | undefined,
            imageUrlTablet: null as string | null | undefined,
            imageUrlMobile: null as string | null | undefined,
            imagePosition: 'right' as 'left' | 'right',
        }));

    // Pick the first active banner that has both desktop & mobile images
    // for the premium Hero Section; fall back to first carousel item otherwise
    const heroBanner = carouselItems.find(
        (item) =>
            item.isPublished !== false &&
            item.imageUrl &&
            item.imageUrlMobile
    ) ?? carouselItems[0] ?? null;

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section>
                {heroBanner?.imageUrlMobile ? (
                    <HeroSection
                        title={heroBanner.title || 'Global Edge Shop'}
                        subtitle={heroBanner.subtitle ?? undefined}
                        buttonCaption={heroBanner.buttonCaption || 'Shop Now'}
                        href={heroBanner.href || '/shop/products'}
                        desktopImageUrl={heroBanner.imageUrl}
                        mobileImageUrl={heroBanner.imageUrlMobile}
                    />
                ) : (
                    <HeroCarousel items={carouselItems} />
                )}
            </section>

            {/* Trust Badges */}
            <section className="bg-[#F4F5F2] border-y border-[#E5E7EB]">
                <div className="container-premium py-8 md:py-10">
                    <FadeInSection>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={feature.title} 
                                className="flex items-center gap-3 md:gap-4"
                            >
                                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#9DBE91]/15 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-[#1B3022]" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm md:text-base text-[#1B3022]">
                                        {feature.title}
                                    </h4>
                                    <p className="text-xs md:text-sm text-[#5A6B5E]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Category Cards Section */}
            <section className="section-padding-sm bg-[#F9FAF7]">
                <div className="container-premium">
                    {/* Section Header */}
                    <FadeInSection>
                    <div className="text-center mb-12 md:mb-16">
                        <span className="text-sm font-semibold text-[#9DBE91] tracking-widest uppercase mb-4 block">
                            Collections
                        </span>
                        <h2 className="font-bold text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[#1B3022] mb-5 tracking-tight">
                            Shop by Category
                        </h2>
                        <p className="text-[#5A6B5E] max-w-2xl mx-auto text-lg">
                            Discover our curated selection of premium packaging solutions
                        </p>
                    </div>
                    </FadeInSection>

                    {/* Category Grid */}
                    <FadeInSection delay={150}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                        {categories.map((cat, index) => (
                            <Link 
                                key={cat.name} 
                                href={cat.href}
                                className="group relative overflow-hidden rounded-3xl aspect-4/5 md:aspect-3/4"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        priority={index === 0}
                                        unoptimized
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-[#1B3022]/80 via-[#1B3022]/30 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                                    <div className="transform transition-all duration-500 group-hover:translate-y-2">
                                        <h3 className="font-bold text-2xl md:text-3xl text-white mb-2 tracking-tight">
                                            {cat.name}
                                        </h3>
                                        <p className="text-white/85 text-sm mb-4">
                                            {cat.description}
                                        </p>
                                        
                                        {/* CTA */}
                                        <span className="inline-flex items-center gap-2 text-white text-sm font-semibold">
                                            <span>Explore Collection</span>
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Border Effect */}
                                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-3xl transition-all duration-500" />
                            </Link>
                        ))}
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="section-padding-sm bg-[#F4F5F2]">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
                        <div>
                            <span className="text-sm font-semibold text-[#9DBE91] tracking-widest uppercase mb-3 block">
                                Just In
                            </span>
                            <h2 className="font-bold text-2xl md:text-[2rem] lg:text-[2.5rem] text-[#1B3022] tracking-tight">
                                New Arrivals
                            </h2>
                        </div>
                        <Link 
                            href="/shop/products?tag=new" 
                            className="inline-flex items-center gap-2 text-[#9DBE91] font-semibold hover:gap-3 transition-all duration-300"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    </FadeInSection>
                    <FadeInSection delay={100}>
                    <ProductSlider 
                        products={newArrivals} 
                        showBottom
                    />
                    </FadeInSection>
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="section-padding-sm bg-[#F9FAF7]">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
                        <div>
                            <span className="text-sm font-semibold text-[#9DBE91] tracking-widest uppercase mb-3 block">
                                Customer Favorites
                            </span>
                            <h2 className="font-bold text-2xl md:text-[2rem] lg:text-[2.5rem] text-[#1B3022] tracking-tight">
                                Best Sellers
                            </h2>
                        </div>
                        <Link 
                            href="/shop/products?tag=best-seller" 
                            className="inline-flex items-center gap-2 text-[#9DBE91] font-semibold hover:gap-3 transition-all duration-300"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    </FadeInSection>
                    <FadeInSection delay={100}>
                    <ProductSlider 
                        products={bestSelling} 
                        showBottom
                    />
                    </FadeInSection>
                </div>
            </section>

            {/* Story/About Banner */}
            <section className="section-padding bg-[#1B3022] text-white">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <FadeInSection direction="right" className="order-2 lg:order-1">
                            <span className="text-sm font-semibold tracking-widest uppercase mb-5 block text-[#9DBE91]">
                                Our Story
                            </span>
                            <h2 className="text-white/80 font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight tracking-tight">
                                Crafted with Care, <br />Delivered with Love
                            </h2>
                            <p className="text-white/60 leading-relaxed mb-8 max-w-lg text-lg">
                                We believe in sustainable, thoughtful packaging that makes every 
                                unboxing moment special. Each product is designed with both aesthetics 
                                and environmental responsibility in mind.
                            </p>
                            {/* <Link 
                                href="/about" 
                                className="inline-flex items-center gap-2 bg-[#9DBE91] hover:bg-[#8AAE7E] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <span>Learn More</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link> */}
                        </FadeInSection>
                        <FadeInSection direction="left" delay={200} className="order-1 lg:order-2 relative aspect-square max-w-md mx-auto lg:max-w-none w-full">
                            <div className="absolute inset-4 md:inset-8 rounded-3xl overflow-hidden bg-[#2D4A36]">
                                <Image
                                    src="/images/woman-holding-recyclable-paper-food-box-recycling-idea.jpg"
                                    alt="Our Story"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    unoptimized
                                    priority
                                />
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-1/3 h-1/3 border-2 border-[#9DBE91]/30 rounded-3xl" />
                            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 border-2 border-[#9DBE91]/30 rounded-3xl" />
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="section-padding-sm bg-[#F9FAF7]">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="text-center mb-12 md:mb-16">
                        <span className="text-sm font-semibold text-[#9DBE91] tracking-widest uppercase mb-4 block">
                            Handpicked for You
                        </span>
                        <h2 className="font-bold text-[2rem] md:text-[2.5rem] lg:text-[3rem] text-[#1B3022] mb-5 tracking-tight">
                            Featured Products
                        </h2>
                        <p className="text-[#5A6B5E] max-w-2xl mx-auto text-lg">
                            Our curated selection of premium packaging essentials
                        </p>
                    </div>
                    </FadeInSection>
                    
                    <FadeInSection delay={150}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {featuredProducts.map((product, index) => (
                            <ProductCard 
                                key={product.slug} 
                                product={product}
                                className={index < 4 ? 'animate-fade-in-up' : ''}
                            />
                        ))}
                    </div>
                    </FadeInSection>

                    {/* View All Button */}
                    <FadeInSection delay={300}>
                    <div className="text-center mt-12 md:mt-14">
                        <Link 
                            href="/shop/products" 
                            className="inline-flex items-center gap-2 bg-transparent border-2 border-[#9DBE91] text-[#9DBE91] px-10 py-4 rounded-full font-semibold hover:bg-[#9DBE91] hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <span>View All Products</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="section-padding-sm bg-[#F4F5F2]">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-bold text-2xl md:text-[2rem] lg:text-[2.5rem] text-[#1B3022] mb-5 tracking-tight">
                            Stay in the Loop
                        </h2>
                        <p className="text-[#5A6B5E] mb-8 text-lg">
                            Subscribe to our newsletter for exclusive offers, new arrivals, and packaging tips.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-4 bg-white border border-[#E5E7EB] rounded-full text-base text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all placeholder:text-[#5A6B5E]/60"
                            />
                            <button
                                type="submit"
                                className="bg-[#9DBE91] hover:bg-[#8AAE7E] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Browsing History - Lazy loaded */}
            <Suspense fallback={<div className="py-20" />}>
                <section id="browsing-history" className="section-padding-sm bg-[#F9FAF7] border-t border-[#E5E7EB]">
                    <div className="container-premium">
                        <BrowsingHistoryList />
                    </div>
                </section>
            </Suspense>
        </div>
    )
}