import React from 'react';
import { cn } from '@/lib/utils';

// Product Card Skeleton
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-stone-100',
        className
      )}
    >
      {/* Image Skeleton */}
      <div className="aspect-square bg-stone-100 animate-pulse" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-stone-100 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-stone-100 animate-pulse" />
        </div>

        {/* Dimensions */}
        <div className="h-3 w-1/2 rounded bg-stone-100 animate-pulse" />

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3.5 w-3.5 rounded bg-stone-100 animate-pulse" />
            ))}
          </div>
          <div className="h-3 w-12 rounded bg-stone-100 animate-pulse" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-5 w-20 rounded bg-stone-100 animate-pulse" />
          <div className="h-4 w-14 rounded bg-stone-100 animate-pulse" />
        </div>

        {/* Button */}
        <div className="h-10 w-full rounded-full bg-stone-100 animate-pulse" />
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Filter Sidebar Skeleton
export function FilterSidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'w-full max-w-xs bg-white rounded-lg shadow-sm border border-stone-100 p-5',
        className
      )}
    >
      {/* Title */}
      <div className="h-6 w-20 rounded bg-stone-100 animate-pulse mb-4" />

      {/* Filter Sections */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border-b border-stone-200/80 py-4 last:border-b-0">
          {/* Section Title */}
          <div className="h-4 w-24 rounded bg-stone-100 animate-pulse mb-4" />

          {/* Section Content */}
          <div className="space-y-3">
            {i < 2 ? (
              // Checkbox items
              [...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-stone-100 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-stone-100 animate-pulse" />
                </div>
              ))
            ) : (
              // Range slider
              <>
                <div className="flex justify-between">
                  <div className="h-3 w-10 rounded bg-stone-100 animate-pulse" />
                  <div className="h-3 w-10 rounded bg-stone-100 animate-pulse" />
                </div>
                <div className="h-2 w-full rounded-full bg-stone-100 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded bg-stone-100 animate-pulse" />
                  <div className="h-8 flex-1 rounded bg-stone-100 animate-pulse" />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </aside>
  );
}

// Sorting Bar Skeleton
export function SortingBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 border-b border-stone-100',
        className
      )}
    >
      <div className="h-4 w-32 rounded bg-stone-100 animate-pulse" />
      <div className="h-10 w-48 rounded-lg bg-stone-100 animate-pulse" />
    </div>
  );
}

// Full Page Skeleton
export function ProductListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebarSkeleton className="hidden lg:block shrink-0" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Sorting Bar */}
            <SortingBarSkeleton />

            {/* Filter Tags Skeleton */}
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-24 rounded-full bg-stone-100 animate-pulse" />
              ))}
            </div>

            {/* Product Grid */}
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
