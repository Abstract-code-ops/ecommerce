import ProductSlider from "@/components/layout/shop/product-slider"
import { ProductCard } from "@/components/layout/shop/shop-card"
import HeroCarousel from "@/components/layout/home/hero-carousel"
import BrowsingHistoryList from "@/components/shared/browsing-history-list"
import FadeInSection from "@/components/shared/fade-in-section"
import { getProductByTag, getFeaturedProducts } from "@/lib/actions/product.actions"
import { getBanners } from "@/lib/actions/banner.actions"
import data from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { ArrowRight, Leaf, Truck, RefreshCw, Shield } from "lucide-react"

// Increase revalidation time for better caching (5 minutes)
export const revalidate = 300;

// Define categories for navigation with images
const categories = [
    { 
        name: "Paper Bags", 
        href: "/shop/products?category=Paperbags", 
        description: "Eco-friendly & sustainable", 
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
        description: "Durable & versatile", 
        image: "/images/anna-szentgyorgyi-bWMp9C3DFYE-unsplash.jpg"
    },
]

// Trust badges/features
const features = [
    { icon: Leaf, title: "Eco-Friendly", description: "Sustainable materials" },
    { icon: Truck, title: "Free Shipping", description: "On orders over $100" },
    { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy" },
    { icon: Shield, title: "Secure Checkout", description: "100% protected" },
]

export default async function Page() {
    // Fetch data inside the component to ensure fresh data on each request
    const [bestSelling, todayDeals, featuredProducts, dbBanners] = await Promise.all([
        getProductByTag({tag: 'best-seller'}),
        getProductByTag({tag: 'today-deal'}),
        getFeaturedProducts(8),
        getBanners()
    ]);

    // Map DB banners to Carousel format, fallback to default data if empty
    const carouselItems = dbBanners.length > 0 
        ? dbBanners.map(b => ({
            title: b.title,
            imageUrl: b.image_url,
            href: b.link_url || '#',
            buttonCaption: b.button_caption,
            isPublished: b.is_active
        }))
        : data.carousels;

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative">
                <HeroCarousel items={carouselItems} />
            </section>

            {/* Trust Badges */}
            <section className="bg-muted/50 border-y border-border/50">
                <div className="container-premium py-6 md:py-8">
                    <FadeInSection>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={feature.title} 
                                className="flex items-center gap-3 md:gap-4"
                            >
                                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm md:text-base text-foreground">
                                        {feature.title}
                                    </h4>
                                    <p className="text-xs md:text-sm text-muted-foreground">
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
            <section className="section-padding-sm">
                <div className="container-premium">
                    {/* Section Header */}
                    <FadeInSection>
                    <div className="text-center mb-10 md:mb-14">
                        <span className="text-sm font-medium text-primary tracking-wider uppercase mb-3 block">
                            Collections
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover our curated selection of premium packaging solutions
                        </p>
                    </div>
                    </FadeInSection>

                    {/* Category Grid */}
                    <FadeInSection delay={150}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {categories.map((cat, index) => (
                            <Link 
                                key={cat.name} 
                                href={cat.href}
                                className="group relative overflow-hidden rounded-xl aspect-[4/5] md:aspect-[3/4]"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                                    <div className="transform transition-all duration-500 group-hover:translate-y-[-8px]">
                                        <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
                                            {cat.name}
                                        </h3>
                                        <p className="text-white/80 text-sm mb-4">
                                            {cat.description}
                                        </p>
                                        
                                        {/* CTA */}
                                        <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
                                            <span>Explore Collection</span>
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Border Effect */}
                                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-all duration-500" />
                            </Link>
                        ))}
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="section-padding-sm bg-muted/30">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
                        <div>
                            <span className="text-sm font-medium text-primary tracking-wider uppercase mb-2 block">
                                Just In
                            </span>
                            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
                                New Arrivals
                            </h2>
                        </div>
                        <Link 
                            href="/shop/products?tag=new" 
                            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    </FadeInSection>
                    <FadeInSection delay={100}>
                    <ProductSlider 
                        products={todayDeals} 
                        showBottom
                    />
                    </FadeInSection>
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="section-padding-sm">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
                        <div>
                            <span className="text-sm font-medium text-primary tracking-wider uppercase mb-2 block">
                                Customer Favorites
                            </span>
                            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
                                Best Sellers
                            </h2>
                        </div>
                        <Link 
                            href="/shop/products?tag=best-seller" 
                            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
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
            <section className="section-padding bg-primary text-primary-foreground">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <FadeInSection direction="right" className="order-2 lg:order-1">
                            <span className="text-sm font-medium tracking-wider uppercase mb-4 block opacity-70">
                                Our Story
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
                                Crafted with Care, <br />Delivered with Love
                            </h2>
                            <p className="text-primary-foreground/80 leading-relaxed mb-8 max-w-lg">
                                We believe in sustainable, thoughtful packaging that makes every 
                                unboxing moment special. Each product is designed with both aesthetics 
                                and environmental responsibility in mind.
                            </p>
                            <Link 
                                href="/about" 
                                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200"
                            >
                                <span>Learn More</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </FadeInSection>
                        <FadeInSection direction="left" delay={200} className="order-1 lg:order-2 relative aspect-square max-w-md mx-auto lg:max-w-none w-full">
                            <div className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden bg-muted">
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
                            <div className="absolute top-0 right-0 w-1/3 h-1/3 border-2 border-white/20 rounded-2xl" />
                            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 border-2 border-white/20 rounded-2xl" />
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="section-padding-sm">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="text-center mb-10 md:mb-14">
                        <span className="text-sm font-medium text-primary tracking-wider uppercase mb-3 block">
                            Handpicked for You
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                            Featured Products
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
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
                    <div className="text-center mt-10 md:mt-12">
                        <Link 
                            href="/shop/products" 
                            className="inline-flex items-center gap-2 btn btn-outline btn-soft px-8"
                        >
                            <span>View All Products</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="section-padding-sm bg-muted/50">
                <div className="container-premium">
                    <FadeInSection>
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                            Stay in the Loop
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Subscribe to our newsletter for exclusive offers, new arrivals, and packaging tips.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-soft whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Browsing History - Lazy loaded */}
            <Suspense fallback={<div className="py-16" />}>
                <section id="browsing-history" className="section-padding-sm border-t border-border/50">
                    <div className="container-premium">
                        <BrowsingHistoryList />
                    </div>
                </section>
            </Suspense>
        </div>
    )
}