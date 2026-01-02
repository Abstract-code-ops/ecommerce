'use client'
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Star, Heart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { IProduct } from "@/lib/db/models/product.model";
import AddToCartButton from "./addToCart";
import useWishlistStore from "@/lib/hooks/useWishlistStore";
import { toast } from "react-toastify";

// --- Premium Product Card System ---

export interface ProductCardProps {
    product: IProduct
    className?: string
    isDeal?: boolean
    showBottom?: boolean
}

/**
 * ProductCard - Premium Design
 * Clean, minimal with elegant hover effects
 */
export function ProductCard({
    product,
    className,
    isDeal = false,
    showBottom = true
}: ProductCardProps) {
    const { toggleItem, isInWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    
    // Prevent hydration mismatch by only reading wishlist state after mount
    useEffect(() => {
        setMounted(true);
    }, []);
    
    const isWishlisted = mounted && isInWishlist(product._id.toString());

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem({
            _id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            image: product.images[0] || '',
            price: product.price,
            category: product.category,
        });
        if (added) {
            toast.success('Added to wishlist');
        } else {
            toast.info('Removed from wishlist');
        }
    };

    const discountPercent = isDeal && product.listPrice && product.listPrice > product.price
        ? Math.round(100 - (product.price / product.listPrice) * 100)
        : 0;

    return (
        <div className={cn(
            "group flex flex-col bg-card rounded-xl overflow-hidden transition-all duration-300",
            "hover:shadow-xl hover:-translate-y-1",
            className
        )}>
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Link href={`/shop/products/${product.slug}`} className="block h-full">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading="lazy"
                        unoptimized
                    />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isDeal && discountPercent > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-destructive text-white rounded">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.tags?.includes('new') && (
                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded">
                            New
                        </span>
                    )}
                    {product.tags?.includes('best-seller') && (
                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-accent text-foreground rounded">
                            Bestseller
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button 
                    onClick={handleWishlistClick}
                    className={cn(
                        "absolute top-3 right-3 z-10 p-2.5 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-sm",
                        isWishlisted 
                            ? "bg-rose-50 text-rose-500 opacity-100" 
                            : "bg-white/90 text-foreground opacity-0 group-hover:opacity-100 hover:bg-white"
                    )}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                </button>

                {/* Quick Add - Shows on hover */}
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
                    <AddToCartButton
                        className="w-full text-xs font-medium py-3 px-4 rounded-lg shadow-lg backdrop-blur-sm"
                        price={product.price}
                        quantity={1}
                        text="Quick Add"
                        successText="Added!"
                        cartColor="text-white"
                        itemColor="bg-accent"
                        buttonColor="bg-primary/95 hover:bg-primary"
                        textColor="text-primary-foreground"
                        showPrice={false}
                        product={{
                            _id: product._id.toString(),
                            name: product.name,
                            slug: product.slug,
                            category: product.category,
                            images: product.images,
                            price: product.price,
                            countInStock: product.countInStock || 0
                        }}
                    />
                </div>
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 gap-2 flex-1">
                {/* Category */}
                <span className="text-[11px] text-muted-foreground tracking-wider uppercase font-medium">
                    {product.category}
                </span>

                {/* Title */}
                <Link href={`/shop/products/${product.slug}`} className="flex-1">
                    <h3 className="font-medium text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {showBottom && product.avgRating !== undefined && product.avgRating > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-3.5 h-3.5",
                                        i < Math.floor(product.avgRating || 0)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-border fill-transparent"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            ({product.numReviews || 0})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-auto pt-2">
                    <span className="font-semibold text-foreground text-base md:text-lg">
                        {formatCurrency(product.price)}
                    </span>
                    {isDeal && product.listPrice && product.listPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.listPrice)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Horizontal card variant for cart/listing
export function ProductCardHorizontal({
    product,
    className,
}: {
    product: IProduct
    className?: string
}) {
    return (
        <div className={cn(
            "flex gap-4 p-4 bg-card rounded-lg border border-border",
            className
        )}>
            {/* Image */}
            <Link href={`/shop/products/${product.slug}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="100px"
                        unoptimized
                    />
                </div>
            </Link>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
                <Link href={`/shop/products/${product.slug}`}>
                    <h4 className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {product.name}
                    </h4>
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">{product.category}</p>
                <p className="font-semibold text-foreground mt-2">{formatCurrency(product.price)}</p>
            </div>
        </div>
    );
}

// Keep backward compatibility exports
export type CardItem = {
    title: string
    link: { text: string, href: string }
    items: {
        name: string
        items?: string[]
        imageUrl: string
        href: string
    }[]
}
