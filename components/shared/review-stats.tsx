'use client'

import { Star } from 'lucide-react'

type ReviewStatsProps = {
  average: number
  count: number
  distribution: [number, number, number, number, number] // [1★, 2★, 3★, 4★, 5★]
  className?: string
}

export default function ReviewStats({ average, count, distribution, className = '' }: ReviewStatsProps) {
  if (count === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="w-5 h-5" />
          <span className="text-sm">No reviews yet</span>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...distribution)

  return (
    <div className={`${className}`}>
      {/* Average Rating */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold">{average.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {count} {count === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const countForRating = distribution[rating - 1]
            const percentage = maxCount > 0 ? (countForRating / count) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                
                {/* Progress bar */}
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="min-w-[40px] text-right text-sm text-muted-foreground">
                  {countForRating}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
