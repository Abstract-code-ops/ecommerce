'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MoreVertical, Trash2, Edit2, Reply, CheckCircle2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toggleHelpfulVote, deleteReview } from '@/lib/actions/review.actions'
import { toast } from 'sonner'
import type { Review } from '@/lib/actions/review.actions'

type ReviewCardProps = {
  review: Review
  currentUserId?: string
  isAdmin?: boolean
  onEdit?: (review: Review) => void
  onDelete?: () => void
  onReply?: (reviewId: string) => void
}

export default function ReviewCard({
  review,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  onReply,
}: ReviewCardProps) {
  const [hasVoted, setHasVoted] = useState(review.hasVoted || false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === review.userId
  const createdDate = new Date(review.createdAt)
  const daysSinceCreated = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  const canEdit = isOwner && daysSinceCreated <= 7

  const handleVote = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to vote')
      return
    }

    setIsVoting(true)
    try {
      const result = await toggleHelpfulVote(review.id)
      if (result.success) {
        setHasVoted(result.voted || false)
        setHelpfulCount((prev) => (result.voted ? prev + 1 : prev - 1))
      } else {
        toast.error(result.error || 'Failed to vote')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return

    setIsDeleting(true)
    try {
      const result = await deleteReview(review.id)
      if (result.success) {
        toast.success('Review deleted')
        onDelete?.()
      } else {
        toast.error(result.error || 'Failed to delete review')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* User avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review.userFullName?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.userFullName || 'Anonymous'}</span>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Purchase</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {createdDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions dropdown */}
        {(isOwner || isAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(review)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {(canEdit || isAdmin) && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              {isAdmin && !review.adminReply && (
                <DropdownMenuItem onClick={() => onReply?.(review.id)}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Title */}
      {review.title && <h4 className="font-semibold text-lg mb-2 break-words">{review.title}</h4>}

      {/* Comment */}
      <p className="text-foreground mb-4 whitespace-pre-wrap break-words">{review.comment}</p>

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-4 pl-4 border-l-2 border-primary bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">Store Response</span>
            {review.adminReplyAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(review.adminReplyAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{review.adminReply}</p>
        </div>
      )}

      {/* Footer: Helpful vote */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t dark:border-gray-800">
        <button
          onClick={handleVote}
          disabled={isVoting || !currentUserId}
          className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            hasVoted
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-primary' : ''}`} />
          <span>Helpful ({helpfulCount})</span>
        </button>

        {!currentUserId && (
          <span className="text-xs text-muted-foreground">
            Sign in to vote
          </span>
        )}
      </div>
    </div>
  )
}
