'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { connectToDB } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'


export type Review = {
  id: string
  productId: string
  userId: string
  orderId: string | null
  rating: number
  title: string | null
  comment: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  adminReply: string | null
  adminReplyAt: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  userFullName?: string
  userEmail?: string
  hasVoted?: boolean
}

export type ReviewStats = {
  average: number
  count: number
  distribution: [number, number, number, number, number] // [1★, 2★, 3★, 4★, 5★]
}

export async function getProductReviews(
  productId: string,
  options?: {
    page?: number
    limit?: number
    sort?: 'recent' | 'helpful' | 'highest' | 'lowest'
  }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const page = options?.page || 1
    const limit = options?.limit || 10
    const offset = (page - 1) * limit
    const sort = options?.sort || 'recent'

    // Build query with user profile JOIN
    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_user_id_fkey(full_name)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .range(offset, offset + limit - 1)

    // Apply sorting
    switch (sort) {
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'helpful':
        query = query.order('helpful_count', { ascending: false })
        break
      case 'highest':
        query = query.order('rating', { ascending: false })
        break
      case 'lowest':
        query = query.order('rating', { ascending: true })
        break
    }

    const { data: reviews, error, count } = await query

    if (error) throw error

    // Get current user's votes (if authenticated)
    let userVotes: Set<string> = new Set()
    if (user) {
      const reviewIds = reviews?.map(r => r.id) || []
      if (reviewIds.length > 0) {
        const { data: votes } = await supabase
          .from('review_votes')
          .select('review_id')
          .eq('user_id', user.id)
          .in('review_id', reviewIds)
        
        userVotes = new Set(votes?.map(v => v.review_id) || [])
      }
    }

    // Format reviews
    const formattedReviews: Review[] = reviews?.map(review => ({
      id: review.id,
      productId: review.product_id,
      userId: review.user_id,
      orderId: review.order_id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.is_verified_purchase,
      helpfulCount: review.helpful_count,
      adminReply: review.admin_reply,
      adminReplyAt: review.admin_reply_at,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      userFullName: review.profiles?.full_name || 'Anonymous',
      hasVoted: userVotes.has(review.id),
    })) || []

    return {
      success: true,
      data: formattedReviews,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

export async function getReviewStats(productId: string, forceRecalculate = false): Promise<{ success: boolean; data?: ReviewStats; error?: string }> {
  try {
    await connectToDB()
    
    if (!forceRecalculate) {
      const product = await Product.findById(productId).select('reviewStats').lean()
      
      if (product?.reviewStats) {
        return {
          success: true,
          data: product.reviewStats as ReviewStats,
        }
      }
    }

    // If not cached, calculate from Supabase
    const supabase = createAdminClient()
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (error) throw error

    if (!reviews || reviews.length === 0) {
      return {
        success: true,
        data: {
          average: 0,
          count: 0,
          distribution: [0, 0, 0, 0, 0],
        },
      }
    }

    // Calculate stats
    const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0]
    let sum = 0

    reviews.forEach(review => {
      sum += review.rating
      distribution[review.rating - 1]++
    })

    const stats: ReviewStats = {
      average: sum / reviews.length,
      count: reviews.length,
      distribution,
    }

    // Cache in MongoDB (async, don't wait) - only if not force recalculating
    if (!forceRecalculate) {
      Product.findByIdAndUpdate(productId, { 
        reviewStats: stats,
        avgRating: stats.average,
        numReviews: stats.count,
      }).catch(err => 
        console.error('Error caching review stats:', err)
      )
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error getting review stats:', error)
    return { success: false, error: 'Failed to get review stats' }
  }
}

// =============================================================================
// CREATE REVIEW
// =============================================================================

export async function createReview(data: {
  productId: string
  rating: number
  title?: string
  comment: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate input
    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    if (data.comment.length < 10) {
      return { success: false, error: 'Comment must be at least 10 characters' }
    }

    if (data.comment.length > 2000) {
      return { success: false, error: 'Comment must be less than 2000 characters' }
    }

    if (data.title && data.title.length > 100) {
      return { success: false, error: 'Title must be less than 100 characters' }
    }

    // Check if user has already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', data.productId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { success: false, error: 'You have already reviewed this product' }
    }

    // Check if user has purchased this product (for verified badge)
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_items(mongo_product_id)')
      .eq('user_id', user.id)
      .in('status', ['delivered', 'completed'])

    let isVerifiedPurchase = false
    let orderId: string | null = null

    if (orders) {
      for (const order of orders) {
        const hasProduct = order.order_items?.some(
          (item: any) => item.mongo_product_id === data.productId
        )
        if (hasProduct) {
          isVerifiedPurchase = true
          orderId = order.id
          break
        }
      }
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: data.productId,
        user_id: user.id,
        order_id: orderId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        is_verified_purchase: isVerifiedPurchase,
      })
      .select()
      .single()

    if (error) throw error

    // Update MongoDB stats synchronously (with retry)
    await updateProductReviewStats(data.productId)

    // Revalidate product page and category pages
    revalidatePath(`/shop/products/${data.productId}`)
    revalidatePath('/shop/products')
    revalidatePath('/shop')

    return {
      success: true,
      data: {
        id: review.id,
        message: 'Review submitted successfully',
      },
    }
  } catch (error: any) {
    console.error('Error creating review:', error)
    
    // Handle duplicate error
    if (error.code === '23505') {
      return { success: false, error: 'You have already reviewed this product' }
    }
    
    return { success: false, error: 'Failed to submit review' }
  }
}

// =============================================================================
// UPDATE REVIEW (7-day limit check)
// =============================================================================

export async function updateReview(
  reviewId: string,
  data: {
    rating: number
    title?: string
    comment: string
  }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate input
    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    if (data.comment.length < 10) {
      return { success: false, error: 'Comment must be at least 10 characters' }
    }

    if (data.comment.length > 2000) {
      return { success: false, error: 'Comment must be less than 2000 characters' }
    }

    // Get existing review
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id, product_id, created_at')
      .eq('id', reviewId)
      .single()

    if (fetchError || !review) {
      return { success: false, error: 'Review not found' }
    }

    // Check ownership
    if (review.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check 7-day limit
    const createdAt = new Date(review.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff > 7) {
      return { success: false, error: 'Reviews can only be edited within 7 days' }
    }

    // Update review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
      })
      .eq('id', reviewId)

    if (updateError) throw updateError

    // Update MongoDB stats asynchronously
    updateProductReviewStats(review.product_id).catch(err =>
      console.error('Error updating review stats:', err)
    )

    // Revalidate product page and category pages
    revalidatePath(`/shop/products/${review.product_id}`)
    revalidatePath('/shop/products')
    revalidatePath('/shop')

    return { success: true, message: 'Review updated successfully' }
  } catch (error) {
    console.error('Error updating review:', error)
    return { success: false, error: 'Failed to update review' }
  }
}

// =============================================================================
// DELETE REVIEW (7-day limit check)
// =============================================================================

export async function deleteReview(reviewId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get existing review
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id, product_id, created_at')
      .eq('id', reviewId)
      .single()

    if (fetchError || !review) {
      return { success: false, error: 'Review not found' }
    }

    // Check ownership
    if (review.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check 7-day limit
    const createdAt = new Date(review.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff > 7) {
      return { success: false, error: 'Reviews can only be deleted within 7 days' }
    }

    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (deleteError) throw deleteError

    // Update MongoDB stats asynchronously
    updateProductReviewStats(review.product_id).catch(err =>
      console.error('Error updating review stats:', err)
    )

    // Revalidate product page and category pages
    revalidatePath(`/shop/products/${review.product_id}`)
    revalidatePath('/shop/products')
    revalidatePath('/shop')

    return { success: true, message: 'Review deleted successfully' }
  } catch (error) {
    console.error('Error deleting review:', error)
    return { success: false, error: 'Failed to delete review' }
  }
}

// =============================================================================
// TOGGLE HELPFUL VOTE
// =============================================================================

export async function toggleHelpfulVote(reviewId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Remove vote
      const { error } = await supabase
        .from('review_votes')
        .delete()
        .eq('id', existingVote.id)

      if (error) throw error

      return { success: true, voted: false }
    } else {
      // Add vote
      const { error } = await supabase
        .from('review_votes')
        .insert({
          review_id: reviewId,
          user_id: user.id,
        })

      if (error) throw error

      return { success: true, voted: true }
    }
  } catch (error) {
    console.error('Error toggling helpful vote:', error)
    return { success: false, error: 'Failed to update vote' }
  }
}

// =============================================================================
// GET USER REVIEWS (for profile page)
// =============================================================================

export async function getUserReviews(userId?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If no userId provided, get current user's reviews
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      return { success: false, error: 'User not found' }
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get product details from MongoDB
    await connectToDB()
    const productIds = [...new Set(reviews?.map(r => r.product_id) || [])]
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name slug images')
      .lean()

    const productMap = new Map(
      products.map(p => [p._id.toString(), p])
    )

    // Format reviews with product data
    const formattedReviews = reviews?.map(review => {
      const product = productMap.get(review.product_id)
      return {
        id: review.id,
        productId: review.product_id,
        productName: product?.name || 'Unknown Product',
        productSlug: product?.slug,
        productImage: product?.images?.[0],
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.is_verified_purchase,
        helpfulCount: review.helpful_count,
        adminReply: review.admin_reply,
        adminReplyAt: review.admin_reply_at,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        canEdit: user?.id === targetUserId && 
                 (new Date().getTime() - new Date(review.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7,
      }
    }) || []

    return { success: true, data: formattedReviews }
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// =============================================================================
// CHECK IF USER CAN REVIEW PRODUCT
// =============================================================================

export async function canUserReviewProduct(productId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: true, canReview: false, reason: 'not_authenticated' }
    }

    // Check if user already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      return { success: true, canReview: false, reason: 'already_reviewed' }
    }

    return { success: true, canReview: true }
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return { success: false, error: 'Failed to check eligibility' }
  }
}

// =============================================================================
// HELPER: Update MongoDB product review stats
// =============================================================================

async function updateProductReviewStats(productId: string, retryCount = 0) {
  try {
    // Add small delay on retry to allow Supabase to commit
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Force recalculation from Supabase
    const result = await getReviewStats(productId, true)
    
    if (result.success && result.data) {
      // If no reviews found and this is first attempt, retry once
      if (result.data.count === 0 && retryCount === 0) {
        return updateProductReviewStats(productId, 1)
      }
      
      await connectToDB()
      
      await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            reviewStats: result.data,
            avgRating: result.data.average,
            numReviews: result.data.count,
          }
        },
        { new: true, runValidators: false }
      )
    }
  } catch (error) {
    console.error('Error updating product review stats:', error)
    throw error
  }
}
