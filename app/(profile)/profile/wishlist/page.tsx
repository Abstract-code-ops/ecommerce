'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import useWishlistStore, { WishlistItem } from '@/lib/hooks/useWishlistStore'
import useCartStore from '@/lib/hooks/useCartStore'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-toastify'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      clientId: '',
      productIds: [item._id],
      name: item.name,
      slug: item.slug,
      image: item.image,
      category: item.category,
      price: item.price,
      quantity: 1,
      totalPrice: item.price,
      countInStock: 999, // We don't have stock info in wishlist
    }, 1)
    toast.success(`${item.name} added to cart`)
  }

  const handleRemove = (id: string, name: string) => {
    removeItem(id)
    toast.info(`${name} removed from wishlist`)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl mb-3">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Save items you love by clicking the heart icon on any product. They&apos;ll appear here for easy access later.
        </p>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors btn-hover-lift"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all items from wishlist?')) {
                clearWishlist()
                toast.info('Wishlist cleared')
              }
            }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Image */}
            <Link href={`/shop/products/${item.slug}`} className="block relative aspect-square bg-muted overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemove(item._id, item.name)
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-white"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Link>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {item.category}
                </p>
                <Link href={`/shop/products/${item.slug}`}>
                  <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{formatCurrency(item.price)}</span>
                <span className="text-xs text-muted-foreground">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="pt-6 border-t border-border">
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
