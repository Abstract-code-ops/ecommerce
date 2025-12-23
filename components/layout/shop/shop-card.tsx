import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";
import AddToCartButton from "./addToCart";
import { Button } from "@/components/ui/button";

// --- Original Unrelated Code ---
type CardItem = {
    title: string
    link: { text: string, href: string }
    items: {
        name: string
        items?: string[]
        imageUrl: string
        href: string
    }[]
}

// --- New Rustic Product Card System ---

export interface ProductCardProps {
    product: IProduct
    className?: string
    isDeal?: boolean
    showBottom?: boolean
}


interface CardBottomProps {
    price: number;
    listPrice?: number;
    isDeal?: boolean;
    className?: string;
    forListing?: boolean;
    plain?: boolean;
    product?: IProduct;
}

/**
 * ProductCard (Main Component)
 * Orchestrates the subcomponents.
 * Rustic Style: No rounded corners, no borders, soft shadows.
 */
export function ProductCard({
    product,
    className,
    isDeal = false,
    showBottom = true
}: ProductCardProps) {

    /**
     * 1. ProductImage
     * Rustic styling, no textures, soft hover scale.
     */
    const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
        return (
            <div className="group relative w-full overflow-hidden bg-stone-200 aspect-4/5">
                <Link href={`/shop/products/${product.slug}`}>
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-107"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                    />
                </Link>
                {/* Subtle warm overlay for rustic tone blending */}
                <div className="pointer-events-none absolute inset-0 bg-stone-900/5 mix-blend-multiply" />
            </div>
        );
    };

    /**
     * 2. Rating
     * Renders stars in rustic warm neutral colors.
     */
    const Rating = ({ rating, size }: { rating: number, size: number }) => {
        const fullStars = Math.floor(rating)
        const partialStar = rating % 1
        const emptyStars = 5 - Math.ceil(rating)

        return (
            <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                    key={`full-${i}`}
                    className={`w-3.5 h-3.5 fill-[#FFC67D]`}/>
                ))}
                {partialStar > 0 &&
                <div className="relative">
                    <Star className={`w-3.5 h-3.5`}/>
                    <div 
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{width: `${partialStar*100}%`}}>
                            <Star className={`w-3.5 h-3.5 fill-[#FFC67D]`}/>
                    </div>
                </div>
                }
                {[...Array(emptyStars)].map((_,i) => (
                    <Star
                    key={`empty-${i}`}
                    className={`w-3.5 h-3.5`}
                    />
                ))

                }
            </div>
        );
    };

    /**
     * 3. CardBottom
     * Handles pricing, deal logic, and add-to-cart action.
     */
    const CardBottom = ({ price, listPrice, isDeal, className, forListing, plain, product: cardProduct }: CardBottomProps) => {
        // Calculate discount percentage if it's a deal and listPrice exists
        const discountPercent =
            isDeal && listPrice && listPrice > price
                ? Math.round(100 - (price / listPrice) * 100)
                : 0;
        const stringValue = price.toString()
        const [intValue, decimalValue] = stringValue.includes('.') ? stringValue.split('.') : [stringValue, '']

        return (
            <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 px-1 gap-2 sm:gap-1">
                {/* Left: Price & Deal Info */}
                {plain ? formatCurrency(price):
                (<div className="flex flex-col gap-1">
                    {isDeal ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-900/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm">
                                    DEAL
                                </span>
                                <span className="text-xs font-medium text-red-800">
                                    {discountPercent}% off
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-stone-800">
                                    {formatCurrency(price)}
                                </span>
                                {listPrice && (
                                    <span className="text-xs text-stone-400 line-through decoration-stone-400">
                                        {formatCurrency(listPrice)}
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-stone-800">
                            {formatCurrency(price)}
                        </span>
                    )}
                </div>)}

                {/* Right: Add to Cart Button */}
                <AddToCartButton
                    className="text-xs sm:text-[10px] md:text-xs font-inter rounded-2xl py-1.5 px-3 sm:py-1 sm:px-2 md:py-2 md:px-3 w-full sm:w-auto text-center"
                    price={price}
                    quantity={1}
                    text="Add to cart"
                    successText="Added!"
                    cartColor="text-white"
                    itemColor="bg-yellow-400"
                    buttonColor="bg-primary hover:bg-gray-800"
                    textColor="text-white"
                    showPrice={false} // <-- hide total price to avoid cut-off in carousels/listings
                    product={cardProduct ? {
                        _id: cardProduct._id.toString(),
                        name: cardProduct.name,
                        slug: cardProduct.slug,
                        category: cardProduct.category,
                        images: cardProduct.images,
                        price: cardProduct.price,
                        countInStock: cardProduct.countInStock || 0
                    } : undefined}
                />
            </div>
        );
    };

    return (
        <div
            className={cn(
                "font-inter group flex flex-col shadow-xs transition-shadow duration-300 hover:shadow-sm",
                "max-w-xs overflow-hidden", // Layout constraints
                className
            )}
        >
            {/* 1. Image */}
            <ProductImage src={product.images[0]} alt={product.name} />

            {/* Content Container - Vertical Stack Layout */}
            <div className="flex flex-1 flex-col p-4 space-y-2.5">
                {/* 1. Title */}
                <Link href={`/shop/products/${product.slug}`}>
                    <h3 className="line-clamp-2 text-base font-medium leading-tight text-stone-900 hover:text-secondary hover:underline">
                        {product.name.length > 24 ? product.name.slice(0, 24) + "..." : product.name}
                    </h3>
                </Link>

                {/* 2. Dimensions */}
                {product.dimensions && showBottom && (
                    <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        Size: {product.dimensions.width}cm × {product.dimensions.height}cm × {product.dimensions.depth}cm
                    </p>
                )}

                {/* 3. Price & Rating Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Price */}
                    <div className="flex flex-col gap-1">
                        {isDeal && product.listPrice && product.listPrice > product.price ? (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-red-900/90 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white shadow-sm rounded-sm">
                                        DEAL
                                    </span>
                                    <span className="text-[10px] font-medium text-red-800">
                                        {Math.round(100 - (product.price / product.listPrice) * 100)}% off
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-md font-bold text-stone-800">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="text-xs text-stone-400 line-through">
                                        {formatCurrency(product.listPrice)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <span className="text-md font-bold text-stone-800">
                                {formatCurrency(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    {showBottom && (
                        <div className="flex flex-col items-end gap-0.5">
                            <Rating rating={product.avgRating || 0} size={2} />
                            <span className="text-[10px] text-muted-foreground/70">
                                ({product.numReviews})
                            </span>
                        </div>
                    )}
                </div>

                {/* 4. Add to Cart Button */}
                <AddToCartButton
                    className="w-full text-xs font-inter rounded-lg py-2.5 px-4 transition-all duration-200"
                    price={product.price}
                    quantity={1}
                    text="Add to cart"
                    successText="Added!"
                    cartColor="text-white"
                    itemColor="bg-yellow-400"
                    buttonColor="bg-primary hover:bg-gray-800"
                    textColor="text-white"
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
        </div>
    );
}