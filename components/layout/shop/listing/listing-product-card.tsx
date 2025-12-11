'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { IProduct } from '@/lib/db/models/product.model';
import AddToCartButton from '../addToCart';

interface ListingProductCardProps {
  product: IProduct;
  className?: string;
}

function Rating({ rating, numReviews }: { rating: number; numReviews: number }) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-[#FFC67D] text-[#FFC67D]" />
        ))}
        {partialStar > 0 && (
          <div className="relative">
            <Star className="h-3.5 w-3.5 text-stone-300" />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${partialStar * 100}%` }}
            >
              <Star className="h-3.5 w-3.5 fill-[#FFC67D] text-[#FFC67D]" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-stone-300" />
        ))}
      </div>
      <span className="text-xs text-stone-500">
        {rating.toFixed(1)} ({numReviews})
      </span>
    </div>
  );
}

export default function ListingProductCard({ product, className }: ListingProductCardProps) {
  const hasDiscount = product.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(100 - (product.price / product.listPrice!) * 100)
    : 0;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-stone-100 transition-all duration-300 hover:shadow-lg hover:border-stone-200 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Link href={`/shop/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pb-4">
          <AddToCartButton
            className="scale-90 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 px-4 py-2 text-xs"
            price={product.price}
            quantity={1}
            text="Quick Add"
            successText="Added!"
            cartColor="text-white"
            itemColor="bg-yellow-400"
            buttonColor="bg-primary/95 hover:bg-primary backdrop-blur-sm"
            textColor="text-white"
            showPrice={false}
            product={{
              _id: product._id?.toString() || '',
              name: product.name,
              slug: product.slug,
              category: product.category,
              images: product.images,
              price: product.price,
              countInStock: product.countInStock || 0,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-stone-900 transition-colors hover:text-secondary">
            {product.name}
          </h3>
        </Link>

        {/* Dimensions */}
        {product.dimensions && (
          <p className="mt-1.5 text-xs text-stone-400">
            {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
          </p>
        )}

        {/* Rating */}
        <div className="mt-2">
          <Rating rating={product.avgRating || 0} numReviews={product.numReviews || 0} />
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-stone-900">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.listPrice!)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {/* <div className="mt-3">
          <AddToCartButton
            className="w-full rounded-full py-2.5 text-xs font-medium"
            price={product.price}
            quantity={1}
            text="Add to Cart"
            successText="Added!"
            cartColor="text-white"
            itemColor="bg-yellow-400"
            buttonColor="bg-primary hover:bg-primary/90"
            textColor="text-white"
            showPrice={false}
            product={{
              _id: product._id?.toString() || '',
              name: product.name,
              slug: product.slug,
              category: product.category,
              images: product.images,
              price: product.price,
              countInStock: product.countInStock || 0,
            }}
          />
        </div> */}
      </div>
    </article>
  );
}
