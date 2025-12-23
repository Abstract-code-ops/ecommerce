import React from "react"

export default function Loading() {
  return (
    <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full py-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Image column */}
        <div className="md:col-span-6">
          <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        {/* Info column */}
        <div className="md:col-span-6 space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex items-center gap-3 mt-4">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-8 bg-card rounded-lg border border-border/40 p-4 md:p-5">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="flex gap-3 overflow-x-auto py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
