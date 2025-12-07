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
}


interface CardBottomProps {
    price: number;
    listPrice?: number;
    isDeal?: boolean;
    className?: string;
    forListing?: boolean;
    plain?: boolean;
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
    const CardBottom = ({ price, listPrice, isDeal, className, forListing, plain }: CardBottomProps) => {
        // Calculate discount percentage if it's a deal and listPrice exists
        console.log(price, listPrice, isDeal)
        const discountPercent =
            isDeal && listPrice && listPrice > price
                ? Math.round(100 - (price / listPrice) * 100)
                : 0;
        const stringValue = price.toString()
        const [intValue, decimalValue] = stringValue.includes('.') ? stringValue.split('.') : [stringValue, '']

        return (
            <div className="mt-2 flex items-center justify-between pt-3 px-1 gap-1">
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
                {/* <button
                    className="group flex items-center justify-center gap-2 rounded-sm bg-stone-800 p-2 text-stone-50 cursor-pointer transition-colors duration-300 hover:bg-[#31a97b] focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-1"
                    aria-label="Add to cart"
                >
                    Add to cart <ShoppingCart size={14} strokeWidth={2} />
                </button> */}
                <Button className="active:scale-95 text-xs font-inter cursor-pointer rounded-2xl">
                    <ShoppingCart size={14} strokeWidth={2} />
                    Add to cart
                </Button>
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

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-4">
                {/* 2. Title */}
                <Link href={`/shop/products/${product.slug}`}>
                    <h3 className=" line-clamp-2 text-base font-medium leading-tight text-stone-900 hover:text-secondary hover:underline">
                        {product.name.length > 30 ? product.name.slice(0, 30) + "..." : product.name}
                    </h3>
                </Link>

                <div className="flex gap-2 items-center justify-between mt-2 pr-2">

                {/* Dimensions */}
                    {product.dimensions && 
                        <p className="text-sm text-muted-foreground/80 items-center">
                            {product.dimensions.width}cm X {product.dimensions.height}cm X {product.dimensions.depth}cm
                        </p>
                    }
                    {/* 3. Rating */}
                    <div className="flex gap-1 items-center">
                        <Rating rating={product.avgRating || 0} size={2} />
                        <h3 className="text-sm">{`(${product.numReviews})`}</h3>
                    </div>
                </div>

                {/* 4. Bottom Section */}
                <CardBottom
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={isDeal}
                />
            </div>
        </div>
    );
}