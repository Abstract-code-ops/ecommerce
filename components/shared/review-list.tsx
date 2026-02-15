'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ReviewCard from './review-card'
import ReviewForm from './review-form'
import { getProductReviews, canUserReviewProduct } from '@/lib/actions/review.actions'
import type { Review } from '@/lib/actions/review.actions'
import { toast } from 'sonner'

type ReviewListProps = {
  productId: string
  productName: string
  currentUserId?: string
  isAdmin?: boolean
  onReplyClick?: (reviewId: string) => void
}

export default function ReviewList({
  productId,
  productName,
  currentUserId,
  isAdmin,
  onReplyClick,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent')
  const [canReview, setCanReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  const fetchReviews = useCallback(async (page: number, sort: typeof sortBy) => {
    setIsLoading(true)
    try {
      const result = await getProductReviews(productId, { page, sort, limit: 10 })
      if (result.success) {
        setReviews(result.data || [])
        setTotalPages(result.totalPages || 1)
      } else {
        toast.error('Failed to load reviews')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  const checkReviewEligibility = useCallback(async () => {
    if (!currentUserId) {
      setCanReview(false)
      return
    }

    const result = await canUserReviewProduct(productId)
    if (result.success) {
      setCanReview(result.canReview || false)
    }
  }, [currentUserId, productId])

  useEffect(() => {
    fetchReviews(currentPage, sortBy)
  }, [productId, currentPage, sortBy])

  useEffect(() => {
    checkReviewEligibility()
  }, [currentUserId, productId])

  const handleSortChange = (value: string) => {
    setSortBy(value as typeof sortBy)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    setEditingReview(null)
    setCurrentPage(1)
    fetchReviews(1, sortBy)
    checkReviewEligibility()
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDelete = () => {
    fetchReviews(currentPage, sortBy)
    checkReviewEligibility()
  }

  return (
    <div className="space-y-6">
      {/* Header with Write Review button and Sort */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        
        <div className="flex items-center gap-3">
          {canReview && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-muted-foreground mb-4">No reviews yet</p>
          {canReview && (
            <Button onClick={() => setShowReviewForm(true)}>
              Be the first to review
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={onReplyClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)

                  if (!showPage) {
                    // Show ellipsis
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => {
          setShowReviewForm(false)
          setEditingReview(null)
        }}
        productId={productId}
        productName={productName}
        existingReview={
          editingReview
            ? {
                id: editingReview.id,
                rating: editingReview.rating,
                title: editingReview.title || undefined,
                comment: editingReview.comment,
              }
            : undefined
        }
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}
