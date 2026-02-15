/**
 * Script to sync review stats from Supabase to MongoDB for all products
 * Run with: node lib/db/scripts/sync-review-stats.mjs
 */

import { createClient } from '@supabase/supabase-js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../../../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MONGODB_URI = process.env.MONGODB_URI

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MONGODB_URI) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Connect to MongoDB
await mongoose.connect(MONGODB_URI)
console.log('✅ Connected to MongoDB')

// Get Product model
const Product = mongoose.model('Product')

// Get all reviews from Supabase grouped by product
const { data: reviews, error } = await supabase
  .from('reviews')
  .select('product_id, rating')

if (error) {
  console.error('❌ Error fetching reviews:', error)
  process.exit(1)
}

console.log(`📊 Found ${reviews.length} reviews in Supabase`)

// Group reviews by product_id and calculate stats
const productStats = new Map()

reviews.forEach(review => {
  const productId = review.product_id
  
  if (!productStats.has(productId)) {
    productStats.set(productId, {
      ratings: [],
      distribution: [0, 0, 0, 0, 0]
    })
  }
  
  const stats = productStats.get(productId)
  stats.ratings.push(review.rating)
  stats.distribution[review.rating - 1]++
})

console.log(`📦 Found reviews for ${productStats.size} unique products`)

// Update each product in MongoDB
let updated = 0
let notFound = 0

for (const [productId, stats] of productStats.entries()) {
  const average = stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
  const count = stats.ratings.length
  
  const reviewStats = {
    average: Math.round(average * 100) / 100,
    count: count,
    distribution: stats.distribution
  }
  
  try {
    const result = await Product.findByIdAndUpdate(
      productId,
      {
        reviewStats: reviewStats,
        avgRating: reviewStats.average,
        numReviews: reviewStats.count
      },
      { new: true }
    )
    
    if (result) {
      console.log(`✅ Updated product ${productId}: ${count} reviews, ${reviewStats.average}★`)
      updated++
    } else {
      console.warn(`⚠️  Product not found in MongoDB: ${productId}`)
      notFound++
    }
  } catch (err) {
    console.error(`❌ Error updating product ${productId}:`, err.message)
  }
}

// Also initialize reviewStats for products without reviews
const productsWithoutReviews = await Product.updateMany(
  { reviewStats: { $exists: false } },
  {
    $set: {
      reviewStats: {
        average: 0,
        count: 0,
        distribution: [0, 0, 0, 0, 0]
      }
    }
  }
)

console.log('\n📊 Summary:')
console.log(`✅ Updated ${updated} products with reviews`)
console.log(`⚠️  ${notFound} products not found in MongoDB`)
console.log(`📝 Initialized ${productsWithoutReviews.modifiedCount} products without reviews`)

await mongoose.disconnect()
console.log('✅ Done!')
process.exit(0)
