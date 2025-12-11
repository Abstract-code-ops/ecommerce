import React from 'react';
import ListingProductCard from './listing-product-card';
import { IProduct } from '@/lib/db/models/product.model';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  className?: string;
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4 rounded-full bg-stone-100 p-6">
          <Package className="h-12 w-12 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">No products found</h3>
        <p className="text-sm text-stone-500 max-w-md">
          We couldn&apos;t find any products matching your filters. Try adjusting your criteria or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ListingProductCard key={product._id?.toString() || product.slug} product={product} />
      ))}
    </div>
  );
}
