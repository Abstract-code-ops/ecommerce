'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortingBarProps {
  totalCount: number;
  className?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price (Low → High)' },
  { value: 'price-desc', label: 'Price (High → Low)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

export default function SortingBar({ totalCount, className }: SortingBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentSort = searchParams.get('sort') || 'newest';
  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || 'Newest';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-stone-100', className)}>
      <p className="text-sm text-stone-600">
        <span className="font-semibold text-stone-900">{totalCount}</span> products found
      </p>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300"
        >
          <ArrowUpDown className="h-4 w-4 text-stone-400" />
          <span>Sort by:</span>
          <span className="text-stone-900">{currentLabel}</span>
          <ChevronDown className={cn('h-4 w-4 text-stone-400 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    currentSort === option.value
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-stone-700 hover:bg-stone-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
