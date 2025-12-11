'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterOptions, ProductFilters } from '@/lib/actions/listing.actions';

// Debounce delay in milliseconds (1.5 seconds)
const DEBOUNCE_DELAY = 1500;

interface FilterSidebarProps {
  filterOptions: FilterOptions;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200/80 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-stone-800 cursor-pointer hover:text-stone-900 transition-colors"
      >
        <span className="text-sm tracking-wide uppercase">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function RangeSlider({
  label,
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  unit = '',
  step = 1,
}: {
  label: string;
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
  unit?: string;
  step?: number;
}) {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  const [isDragging, setIsDragging] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with props when URL params change externally
  useEffect(() => {
    if (!isDragging) {
      setLocalMin(currentMin);
      setLocalMax(currentMax);
    }
  }, [currentMin, currentMax, isDragging]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced onChange that waits for user to stop interacting
  const debouncedOnChange = useCallback((newMin: number, newMax: number) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      onChange(newMin, newMax);
      setIsDragging(false);
    }, DEBOUNCE_DELAY);
  }, [onChange]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - step);
    setLocalMin(newMin);
    setIsDragging(true);
    debouncedOnChange(newMin, localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + step);
    setLocalMax(newMax);
    setIsDragging(true);
    debouncedOnChange(localMin, newMax);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-stone-500">
        <span>{unit}{localMin.toFixed(step < 1 ? 1 : 0)}</span>
        <span>{unit}{localMax.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-stone-200" />
        <div
          className="absolute h-full rounded-full bg-primary pointer-events-none"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent pointer-events-auto z-20 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:bg-transparent"
          style={{ pointerEvents: 'none' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent pointer-events-auto z-10 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:bg-transparent"
          style={{ pointerEvents: 'none' }}
        />
        {/* Invisible overlay to enable thumb interactions */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>
      {/* Visual indicator when debouncing */}
      {isDragging && (
        <div className="flex items-center gap-1.5 text-xs text-primary/70">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
          <span>Updating...</span>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="number"
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <span className="text-stone-400">—</span>
        <input
          type="number"
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>
    </div>
  );
}

function StarRatingSelector({
  currentRating,
  onChange,
}: {
  currentRating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(currentRating === rating ? 0 : rating)}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all',
            currentRating === rating
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-stone-100 text-stone-600'
          )}
        >
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < rating ? 'fill-[#FFC67D] text-[#FFC67D]' : 'text-stone-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs">{rating === 5 ? '5 stars' : `${rating} & up`}</span>
        </button>
      ))}
    </div>
  );
}

export default function FilterSidebar({ filterOptions, className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const getCurrentFilters = (): ProductFilters => {
    return {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minWidth: searchParams.get('minWidth') ? Number(searchParams.get('minWidth')) : undefined,
      maxWidth: searchParams.get('maxWidth') ? Number(searchParams.get('maxWidth')) : undefined,
      minHeight: searchParams.get('minHeight') ? Number(searchParams.get('minHeight')) : undefined,
      maxHeight: searchParams.get('maxHeight') ? Number(searchParams.get('maxHeight')) : undefined,
      minDepth: searchParams.get('minDepth') ? Number(searchParams.get('minDepth')) : undefined,
      maxDepth: searchParams.get('maxDepth') ? Number(searchParams.get('maxDepth')) : undefined,
      minReviews: searchParams.get('minReviews') ? Number(searchParams.get('minReviews')) : undefined,
      maxReviews: searchParams.get('maxReviews') ? Number(searchParams.get('maxReviews')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      deals: searchParams.get('deals') === 'true',
    };
  };

  const currentFilters = getCurrentFilters();

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <aside
      className={cn(
        'w-full max-w-xs bg-white rounded-lg shadow-sm border border-stone-100 p-5',
        className
      )}
    >
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Filters</h2>

      {/* Deals & Offers */}
      <CollapsibleSection title="Deals & Offers">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={currentFilters.deals || false}
            onChange={(e) => updateFilters({ deals: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300 accent-secondary text-primary focus:ring-primary/30 cursor-pointer"
          />
          <span className="text-sm text-stone-700">Show only deals</span>
        </label>
      </CollapsibleSection>

      {/* Categories */}
      <CollapsibleSection title="Categories">
        <div className="flex flex-col gap-2">
          {filterOptions.categories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="category"
                checked={currentFilters.category === cat}
                onChange={() => updateFilters({ category: currentFilters.category === cat ? undefined : cat })}
                className="h-4 w-4 border-stone-300 text-primary accent-secondary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-sm text-stone-700">{cat}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Price Range">
        <RangeSlider
          label="Price"
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          currentMin={currentFilters.minPrice ?? filterOptions.priceRange.min}
          currentMax={currentFilters.maxPrice ?? filterOptions.priceRange.max}
          onChange={(min, max) => updateFilters({ minPrice: min, maxPrice: max })}
          unit="AED "
          step={0.01}
        />
      </CollapsibleSection>

      {/* Dimensions */}
      <CollapsibleSection title="Dimensions" defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-stone-600 mb-2">Width (cm)</p>
            <RangeSlider
              label="Width"
              min={filterOptions.dimensionsRange.width.min}
              max={filterOptions.dimensionsRange.width.max}
              currentMin={currentFilters.minWidth ?? filterOptions.dimensionsRange.width.min}
              currentMax={currentFilters.maxWidth ?? filterOptions.dimensionsRange.width.max}
              onChange={(min, max) => updateFilters({ minWidth: min, maxWidth: max })}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-600 mb-2">Height (cm)</p>
            <RangeSlider
              label="Height"
              min={filterOptions.dimensionsRange.height.min}
              max={filterOptions.dimensionsRange.height.max}
              currentMin={currentFilters.minHeight ?? filterOptions.dimensionsRange.height.min}
              currentMax={currentFilters.maxHeight ?? filterOptions.dimensionsRange.height.max}
              onChange={(min, max) => updateFilters({ minHeight: min, maxHeight: max })}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-600 mb-2">Depth (cm)</p>
            <RangeSlider
              label="Depth"
              min={filterOptions.dimensionsRange.depth.min}
              max={filterOptions.dimensionsRange.depth.max}
              currentMin={currentFilters.minDepth ?? filterOptions.dimensionsRange.depth.min}
              currentMax={currentFilters.maxDepth ?? filterOptions.dimensionsRange.depth.max}
              onChange={(min, max) => updateFilters({ minDepth: min, maxDepth: max })}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Number of Reviews */}
      <CollapsibleSection title="Number of Reviews" defaultOpen={false}>
        <RangeSlider
          label="Reviews"
          min={filterOptions.reviewsRange.min}
          max={filterOptions.reviewsRange.max}
          currentMin={currentFilters.minReviews ?? filterOptions.reviewsRange.min}
          currentMax={currentFilters.maxReviews ?? filterOptions.reviewsRange.max}
          onChange={(min, max) => updateFilters({ minReviews: min, maxReviews: max })}
        />
      </CollapsibleSection>

      {/* Average Rating */}
      <CollapsibleSection title="Average Rating">
        <StarRatingSelector
          currentRating={currentFilters.minRating ?? 0}
          onChange={(rating) => updateFilters({ minRating: rating || undefined })}
        />
      </CollapsibleSection>
    </aside>
  );
}
