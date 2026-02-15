'use client'

import { useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { createReview, updateReview } from '@/lib/actions/review.actions'
import { toast } from 'sonner'

type ReviewFormProps = {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  existingReview?: {
    id: string
    rating: number
    title?: string
    comment: string
  }
  onSuccess?: () => void
}

export default function ReviewForm({
  isOpen,
  onClose,
  productId,
  productName,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const result = existingReview
        ? await updateReview(existingReview.id, { rating, title: title || undefined, comment })
        : await createReview({ productId, rating, title: title || undefined, comment })

      if (result.success) {
        toast.success(existingReview ? 'Review updated successfully' : 'Review submitted successfully')
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              {existingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <p className="text-sm text-muted-foreground">{productName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="mb-2 block">Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <Label htmlFor="title" className="mb-2 block">
              Title (optional)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Sum up your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="mb-2 block">
              Review *
            </Label>
            <textarea
              id="comment"
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              disabled={isSubmitting}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/2000 characters (minimum 10)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0 || comment.trim().length < 10}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : existingReview ? (
                'Update Review'
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
