'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Star, Minus, Plus, Truck, Shield, RefreshCcw, Heart, Share2, Check, Copy, Facebook, Twitter, Link2 } from 'lucide-react';
import { IProduct } from '@/lib/db/models/product.model';
import { formatCurrency } from '@/lib/utils';
import AddToCartButton from './addToCart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';
import useWishlistStore from '@/lib/hooks/useWishlistStore';
import { toast } from 'react-toastify';

type ProductDetailsProps = {
    product: IProduct;
};

const ProductDetailsInfo = (props: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { product } = props;

  // Wishlist
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by only reading wishlist state after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isWishlisted = mounted && isInWishlist(product._id.toString());

  const count = product.countInStock ?? 0;
  const isOutOfStock = count <= 0;
  const isLowStock = count > 0 && count < 5;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };
  const handleIncrement = () => {
    if (quantity < count) setQuantity(q => q + 1);
  };

  // Wishlist handler
  const handleWishlistToggle = useCallback(() => {
    const added = toggleItem({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      price: product.price,
      category: product.category,
    });
    
    if (added) {
      toast.success('Added to wishlist');
    } else {
      toast.info('Removed from wishlist');
    }
  }, [product, toggleItem]);

  // Share handlers
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/shop/products/${product.slug}`;
    }
    return '';
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (platform?: 'facebook' | 'twitter' | 'whatsapp' | 'native') => {
    const shareUrl = getShareUrl();
    const shareText = `Check out ${product.name} - ${formatCurrency(product.price)}`;
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
        setShowShareMenu(false);
      } catch (err) {
        // User cancelled or error
      }
      return;
    }

    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  // Calculate discount
  const hasDiscount = product.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(100 - (product.price / product.listPrice!) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-8 font-inter">
      
      {/* Header Section */}
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">
            {product.category}
          </span>
          {product.tags?.includes('new') && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded">
              New
            </span>
          )}
          {product.tags?.includes('best-seller') && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-accent text-foreground rounded">
              Bestseller
            </span>
          )}
        </div>
        
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
          {product.name}
        </h1>
        
        {/* Rating & Reviews */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(product.avgRating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-border fill-transparent"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.numReviews || 0} reviews)
            </span>
          </div>
          
          {/* Share & Wishlist */}
          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={handleWishlistToggle}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                isWishlisted 
                  ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
              
              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowShareMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[200px] animate-fade-in">
                    <p className="text-xs font-medium text-muted-foreground px-3 py-2">Share this product</p>
                    
                    {/* Native Share (if supported) */}
                    {typeof navigator !== 'undefined' && (
                      <button
                        onClick={() => handleShare('native')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share...</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy link'}</span>
                    </button>
                    
                    <div className="border-t border-border my-1" />
                    
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      <Twitter className="w-4 h-4 text-sky-500" />
                      <span>Twitter</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-3 pt-2">
          <span className="font-semibold text-3xl md:text-4xl text-foreground">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatCurrency(product.listPrice!)}
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-destructive/10 text-destructive rounded">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        {isLowStock && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Only {count} left in stock — order soon
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-destructive rounded-full" />
            <span className="text-sm font-medium">Currently out of stock</span>
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Purchase Section */}
      <div className="space-y-6">
        {/* Quantity Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Quantity</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg">
              <button 
                onClick={handleDecrement}
                disabled={isOutOfStock || quantity <= 1}
                className={cn(
                  "p-3 hover:bg-muted transition-colors rounded-l-lg",
                  (isOutOfStock || quantity <= 1) && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input 
                type="number" 
                min="1" 
                max={count}
                value={quantity}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(count, parseInt(e.target.value) || 1));
                  setQuantity(val);
                }}
                disabled={isOutOfStock}
                className="w-16 text-center bg-transparent font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={handleIncrement}
                disabled={isOutOfStock || quantity >= count}
                className={cn(
                  "p-3 hover:bg-muted transition-colors rounded-r-lg",
                  (isOutOfStock || quantity >= count) && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {!isOutOfStock && (
              <span className="text-sm text-muted-foreground">
                {count} available
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isOutOfStock ? (
            <button 
              className="flex-1 py-4 px-6 bg-muted text-muted-foreground font-medium rounded-lg cursor-not-allowed"
              disabled
            >
              Out of Stock
            </button>
          ) : (
            <AddToCartButton
              className="flex-1 py-4 px-6 rounded-lg font-medium text-base transition-all duration-300 btn-hover-lift"
              price={product.price}
              quantity={quantity}
              text="Add to Cart"
              successText="Added to Cart!"
              cartColor="text-white"
              itemColor="bg-accent"
              buttonColor="bg-primary hover:bg-primary/90"
              textColor="text-primary-foreground"
              product={{
                _id: product._id.toString(),
                name: product.name,
                slug: product.slug,
                category: product.category,
                images: product.images,
                price: product.price,
                countInStock: product.countInStock || 0
              }}
            />
          )}
          
          <button 
            onClick={handleWishlistToggle}
            className={cn(
              "sm:w-auto px-6 py-4 border rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
              isWishlisted 
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" 
                : "border-border hover:bg-muted"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            <span className="sm:hidden">{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center text-center gap-2 p-3">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-3">
            <RefreshCcw className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Easy Returns</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Secure Payment</span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Product Details Accordion */}
      <div className="w-full">
        <Accordion type="single" collapsible defaultValue="description" className="w-full">
          
          {/* Description */}
          <AccordionItem value="description" className="border-border">
            <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
              {product.description || "No description available for this product."}
            </AccordionContent>
          </AccordionItem>

          {/* Specifications */}
          {product.dimensions && Object.keys(product.dimensions).length > 0 && (
            <AccordionItem value="specifications" className="border-border">
              <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
                Specifications
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.dimensions).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Shipping & Returns */}
          <AccordionItem value="shipping" className="border-border">
            <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
              Shipping & Returns
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-6 space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Shipping</h4>
                <p>Standard delivery within 3-5 business days. Express delivery available at checkout for faster shipping.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Returns</h4>
                <p>Returns are accepted within 30 days of purchase for unused items in original packaging. Contact our support team to initiate a return.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="sticky-bottom-mobile">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-semibold text-lg">{formatCurrency(product.price * quantity)}</span>
          </div>
          <div className="flex-1">
            {isOutOfStock ? (
              <button 
                className="w-full py-3 bg-muted text-muted-foreground font-medium rounded-lg cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
            ) : (
              <AddToCartButton
                className="w-full py-3 rounded-lg font-medium"
                price={product.price}
                quantity={quantity}
                text="Add to Cart"
                successText="Added!"
                cartColor="text-white"
                itemColor="bg-accent"
                buttonColor="bg-primary hover:bg-primary/90"
                textColor="text-primary-foreground"
                showPrice={false}
                product={{
                  _id: product._id.toString(),
                  name: product.name,
                  slug: product.slug,
                  category: product.category,
                  images: product.images,
                  price: product.price,
                  countInStock: product.countInStock || 0
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsInfo;
