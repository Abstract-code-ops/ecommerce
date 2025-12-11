'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import FilterSidebar from './filter-sidebar';
import { FilterOptions } from '@/lib/actions/listing.actions';

interface MobileFilterDrawerProps {
  filterOptions: FilterOptions;
}

export default function MobileFilterDrawer({ filterOptions }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full max-w-sm transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-stone-900">Filters</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="h-full overflow-y-auto pb-24">
          <FilterSidebar
            filterOptions={filterOptions}
            className="border-0 rounded-none shadow-none max-w-none"
          />
        </div>

        {/* Drawer Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-200 bg-white p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
