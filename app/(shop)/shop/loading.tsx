import React from "react"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-8 animate-pulse">
      {/* Carousel skeleton */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-700 h-52 md:h-72" />
      </div>

      {/* Category Cards Section Skeleton */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h2 className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl aspect-4/3 md:aspect-square bg-gray-200 dark:bg-gray-700"
            >
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Sections Skeletons */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="flex gap-3 overflow-x-auto py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
          <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="flex gap-3 overflow-x-auto py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border/40 p-4 md:p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Browsing History Skeleton */}
      <section className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="flex gap-3 overflow-x-auto py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-36 h-36 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </section>
    </div>
  )
}
