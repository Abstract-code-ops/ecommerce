'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterTag {
  key: string;
  label: string;
  value: string;
}

interface FilterTagBarProps {
  className?: string;
}

export default function FilterTagBar({ className }: FilterTagBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Build active filter tags from URL params
  const getActiveTags = (): FilterTag[] => {
    const tags: FilterTag[] = [];

    const category = searchParams.get('category');
    if (category) {
      tags.push({ key: 'category', label: 'Category', value: category });
    }

    const deals = searchParams.get('deals');
    if (deals === 'true') {
      tags.push({ key: 'deals', label: 'Deals', value: 'Active' });
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice 
        ? `AED ${minPrice} - AED ${maxPrice}` 
        : minPrice 
        ? `From AED ${minPrice}` 
        : `Up to AED ${maxPrice}`;
      tags.push({ key: 'price', label: 'Price', value: priceLabel });
    }

    const minWidth = searchParams.get('minWidth');
    const maxWidth = searchParams.get('maxWidth');
    if (minWidth || maxWidth) {
      const widthLabel = minWidth && maxWidth 
        ? `${minWidth}cm - ${maxWidth}cm` 
        : minWidth 
        ? `From ${minWidth}cm` 
        : `Up to ${maxWidth}cm`;
      tags.push({ key: 'width', label: 'Width', value: widthLabel });
    }

    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    if (minHeight || maxHeight) {
      const heightLabel = minHeight && maxHeight 
        ? `${minHeight}cm - ${maxHeight}cm` 
        : minHeight 
        ? `From ${minHeight}cm` 
        : `Up to ${maxHeight}cm`;
      tags.push({ key: 'height', label: 'Height', value: heightLabel });
    }

    const minDepth = searchParams.get('minDepth');
    const maxDepth = searchParams.get('maxDepth');
    if (minDepth || maxDepth) {
      const depthLabel = minDepth && maxDepth 
        ? `${minDepth}cm - ${maxDepth}cm` 
        : minDepth 
        ? `From ${minDepth}cm` 
        : `Up to ${maxDepth}cm`;
      tags.push({ key: 'depth', label: 'Depth', value: depthLabel });
    }

    const minReviews = searchParams.get('minReviews');
    const maxReviews = searchParams.get('maxReviews');
    if (minReviews || maxReviews) {
      const reviewsLabel = minReviews && maxReviews 
        ? `${minReviews} - ${maxReviews} reviews` 
        : minReviews 
        ? `${minReviews}+ reviews` 
        : `Up to ${maxReviews} reviews`;
      tags.push({ key: 'reviews', label: 'Reviews', value: reviewsLabel });
    }

    const minRating = searchParams.get('minRating');
    if (minRating) {
      tags.push({ key: 'minRating', label: 'Rating', value: `${minRating}+ stars` });
    }

    const search = searchParams.get('search');
    if (search) {
      tags.push({ key: 'search', label: 'Search', value: `"${search}"` });
    }

    return tags;
  };

  const activeTags = getActiveTags();

  const removeFilter = (tagKey: string) => {
    const params = new URLSearchParams(searchParams.toString());

    switch (tagKey) {
      case 'price':
        params.delete('minPrice');
        params.delete('maxPrice');
        break;
      case 'width':
        params.delete('minWidth');
        params.delete('maxWidth');
        break;
      case 'height':
        params.delete('minHeight');
        params.delete('maxHeight');
        break;
      case 'depth':
        params.delete('minDepth');
        params.delete('maxDepth');
        break;
      case 'reviews':
        params.delete('minReviews');
        params.delete('maxReviews');
        break;
      default:
        params.delete(tagKey);
    }

    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (activeTags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 pb-4', className)}>
      <span className="text-sm font-medium text-stone-600">Active filters:</span>
      
      {activeTags.map((tag) => (
        <button
          key={tag.key}
          onClick={() => removeFilter(tag.key)}
          className="group inline-flex items-center gap-1.5 rounded-full cursor-pointer bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-all hover:bg-stone-200"
        >
          <span className="text-stone-500">{tag.label}:</span>
          <span>{tag.value}</span>
          <X className="h-3 w-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>
      ))}

      <button
        onClick={clearAllFilters}
        className="ml-2 text-xs font-medium cursor-pointer text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
