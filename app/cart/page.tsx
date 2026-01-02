'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/hooks/useCartStore'
import useWishlistStore from '@/lib/hooks/useWishlistStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Trash2, Plus, Minus, ShoppingBag, Banknote, 
  ChevronRight, Shield, Truck, RotateCcw, Tag, 
  Clock, Package, Heart, AlertCircle, User, LogIn,
  MapPin, Check, ChevronDown, Home, Building2, Loader2,
  CheckCircle2, ArrowLeft, Lock, Mail
} from 'lucide-react'
import { toast } from 'react-toastify'
import ShippingAddressForm from '@/components/shared/shipping-address-form'
import { getAddresses, createAddress } from '@/lib/actions/address.actions'
import { createOrder, validateCartStock } from '@/lib/actions/order.actions'
import { Address, ShippingAddressSnapshot, ProductSnapshot } from '@/types/supabase'
import { cn } from '@/lib/utils'

const CartPage = () => {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart, setPaymentMethod } = useCartStore();
  const { items: wishlistItems, toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{ orderNumber: string } | null>(null);
  
  // Address state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  
  // Guest checkout state
  const [guestEmail, setGuestEmail] = useState('');
  
  // Guest address state (when not logged in)
  const [guestAddress, setGuestAddress] = useState<{
    fullName: string;
    street: string;
    city: string;
    emirate: string;
    country: string;
    lat?: number;
    lng?: number;
  } | null>(null);
  
  // Track if addresses have been fetched to prevent duplicate calls on tab focus
  const addressesFetchedRef = useRef(false);

  // Fetch saved addresses when user is logged in (only once)
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setSavedAddresses([]);
        setSelectedAddressId(null);
        addressesFetchedRef.current = false;
        return;
      }
      
      // Prevent refetch on tab focus - only fetch if not already fetched for this user
      if (addressesFetchedRef.current) return;
      
      setIsLoadingAddresses(true);
      try {
        const result = await getAddresses();
        if (result.success && result.data) {
          setSavedAddresses(result.data);
          addressesFetchedRef.current = true;
          // Auto-select default address or first address
          const defaultAddr = result.data.find(a => a.is_default) || result.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Building2;
      default: return MapPin;
    }
  };

  const handleAddressSave = async (address: {
    fullName: string;
    street: string;
    city: string;
    emirate: string;
    country: string;
    lat?: number;
    lng?: number;
  }) => {
    // For guest users, just save locally
    if (!user) {
      setGuestAddress(address);
      toast.success('Address saved for checkout');
      return;
    }
    
    // Use createAddress from address.actions.ts (same as profile page)
    const result = await createAddress({
      label: 'Checkout Address',
      type: 'home',
      full_name: address.fullName,
      phone: null,
      street: address.street,
      city: address.city,
      emirate: address.emirate,
      country: address.country,
      lat: address.lat || null,
      lng: address.lng || null,
      is_default: false,
    });
    
    if (result.success && result.data) {
      toast.success('Address saved successfully');
      // Add to local state and select it
      setSavedAddresses(prev => [...prev, result.data!]);
      setSelectedAddressId(result.data.id);
      setShowAddressForm(false);
    } else {
      toast.error(result.error || 'Failed to save address');
    }
  };

  // Get the shipping address for checkout
  const getCheckoutAddress = (): ShippingAddressSnapshot | null => {
    if (user && selectedAddress) {
      return {
        fullName: selectedAddress.full_name,
        phone: selectedAddress.phone || undefined,
        street: selectedAddress.street,
        city: selectedAddress.city,
        emirate: selectedAddress.emirate,
        country: selectedAddress.country || 'UAE',
        lat: selectedAddress.lat || undefined,
        lng: selectedAddress.lng || undefined,
      };
    }
    if (guestAddress) {
      return {
        fullName: guestAddress.fullName,
        street: guestAddress.street,
        city: guestAddress.city,
        emirate: guestAddress.emirate,
        country: guestAddress.country || 'UAE',
        lat: guestAddress.lat || undefined,
        lng: guestAddress.lng || undefined,
      };
    }
    return null;
  };

  // Stock validation state
  const [stockStatus, setStockStatus] = useState<Map<string, { isAvailable: boolean; availableStock: number }>>(new Map())
  const [isValidatingStock, setIsValidatingStock] = useState(false)
  const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false)

  // Validate stock on mount and when cart items change
  useEffect(() => {
    const validateStock = async () => {
      if (cart.items.length === 0) {
        setStockStatus(new Map())
        setHasOutOfStockItems(false)
        return
      }
      
      setIsValidatingStock(true)
      
      try {
        const itemsToValidate = cart.items.map(item => ({
          mongoProductId: item.productIds[0],
          quantity: item.quantity,
          name: item.name,
        }))
        
        const result = await validateCartStock(itemsToValidate)
        
        if (result.success && result.data) {
          const newStockStatus = new Map<string, { isAvailable: boolean; availableStock: number }>()
          let hasUnavailable = false
          
          result.data.forEach(item => {
            newStockStatus.set(item.mongoProductId, {
              isAvailable: item.isAvailable,
              availableStock: item.availableStock,
            })
            if (!item.isAvailable) {
              hasUnavailable = true
            }
          })
          
          setStockStatus(newStockStatus)
          setHasOutOfStockItems(hasUnavailable)
        }
      } catch (error) {
        console.error('Error validating stock:', error)
      } finally {
        setIsValidatingStock(false)
      }
    }
    
    validateStock()
  }, [cart.items])

  // Handle checkout - update to show specific out of stock errors
  const handleCheckout = async () => {
    // Validation
    if (cart.paymentMethod !== 'CashOnDelivery') {
      toast.error('Please select Cash on Delivery as payment method');
      return;
    }

    const shippingAddress = getCheckoutAddress();
    if (!shippingAddress) {
      toast.error('Please select or add a shipping address');
      return;
    }

    // For guest users, require email
    if (!user && !guestEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Validate email format for guests
    if (!user && guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (hasOutOfStockItems) {
      toast.error('Please remove out-of-stock items before checkout')
      return
    }

    setIsCheckingOut(true);

    try {
      // Prepare order items with product snapshots
      const orderItems = cart.items.map(item => ({
        mongoProductId: item.productIds[0],
        productSnapshot: {
          name: item.name,
          slug: item.slug,
          image: item.image,
          category: item.category,
          price: item.price,
        } as ProductSnapshot,
        quantity: item.quantity,
        unitPrice: item.price,
        size: item.size,
        color: item.color,
      }));

      const subtotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
      
      const result = await createOrder({
        items: orderItems,
        shippingAddress,
        subtotal,
        shipping: cart.shippingPrice || 0,
        tax: cart.taxPrice || 0,
        discount: 0,
        paymentMethod: 'CashOnDelivery',
        guestEmail: !user ? guestEmail : undefined,
      });

      if (result.success && result.data) {
        setCheckoutSuccess({ orderNumber: result.data.orderNumber });
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        // Handle out of stock error with specific items
        if (result.outOfStockItems && result.outOfStockItems.length > 0) {
          const itemNames = result.outOfStockItems.map(i => i.name).join(', ')
          toast.error(`Out of stock: ${itemNames}`)
          // Re-validate stock to update UI
          const itemsToValidate = cart.items.map(item => ({
            mongoProductId: item.productIds[0],
            quantity: item.quantity,
            name: item.name,
          }))
          const revalidate = await validateCartStock(itemsToValidate)
          if (revalidate.success && revalidate.data) {
            const newStockStatus = new Map<string, { isAvailable: boolean; availableStock: number }>()
            revalidate.data.forEach(item => {
              newStockStatus.set(item.mongoProductId, {
                isAvailable: item.isAvailable,
                availableStock: item.availableStock,
              })
            })
            setStockStatus(newStockStatus)
            setHasOutOfStockItems(revalidate.data.some(i => !i.isAvailable))
          }
        } else {
          toast.error(result.error || 'Failed to place order');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRemoveItem = (clientId: string, itemName: string) => {
    removeItem(clientId);
    toast.success(`${itemName} removed from cart`);
  };

  const handleUpdateQuantity = async (clientId: string, newQuantity: number, itemName: string) => {
    try {
      await updateQuantity(clientId, newQuantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setTimeout(() => {
      toast.info('Promo code feature coming soon!');
      setIsApplyingPromo(false);
    }, 500);
  };

  // Calculate estimated delivery date (5-7 business days from now)
  const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date();
    end.setDate(end.getDate() + 10);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Order success state
  if (checkoutSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-4 text-foreground">Order Confirmed</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your order. Your order number is:
          </p>
          <p className="font-mono text-xl font-semibold text-primary mb-6 bg-primary/5 py-3 px-6 rounded-lg inline-block">
            {checkoutSuccess.orderNumber}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            You&apos;ll pay <span className="font-medium text-foreground">Cash on Delivery</span> when your order arrives.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/profile/orders"
              className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              View Orders
            </Link>
            <Link 
              href="/shop"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors btn-hover-lift"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-4 text-foreground">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet. Explore our collection to find something special.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors btn-hover-lift"
          >
            Start Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/shop" 
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Back to shop"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Cart Items Section */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stock validation loading indicator */}
            {isValidatingStock && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking stock availability...
              </div>
            )}
            
            {/* Out of stock warning banner */}
            {hasOutOfStockItems && !isValidatingStock && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Some items in your cart are out of stock. Please remove them to proceed with checkout.</span>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
                <span className="font-medium text-foreground">Cart Items</span>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-border">
                {cart.items.map((item) => {
                  const itemStock = stockStatus.get(item.productIds[0])
                  const isOutOfStock = itemStock && !itemStock.isAvailable
                  const availableStock = itemStock?.availableStock ?? item.countInStock
                  
                  return (
                    <div 
                      key={item.clientId}
                      className={cn(
                        "p-4 md:p-6 transition-all duration-300 relative",
                        isOutOfStock ? "bg-muted/50" : "hover:bg-muted/30"
                      )}
                    >
                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <div className="bg-destructive text-destructive-foreground px-5 py-3 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Out of Stock
                            {availableStock > 0 && (
                              <span className="text-xs opacity-80">
                                (Only {availableStock} available)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 md:gap-6">
                        {/* Product Image */}
                        <Link href={`/shop/products/${item.slug}`} className="shrink-0">
                          <div className={cn(
                            "relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted group",
                            isOutOfStock && "opacity-50"
                          )}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 96px, 128px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className={cn("flex-1 min-w-0", isOutOfStock && "opacity-50")}>
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 space-y-1">
                              <Link 
                                href={`/shop/products/${item.slug}`}
                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              {item.category && (
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const productId = item.productIds[0];
                                  const wasAdded = toggleWishlist({
                                    _id: productId,
                                    name: item.name,
                                    slug: item.slug,
                                    image: item.image,
                                    price: item.price,
                                    category: item.category,
                                  });
                                  toast.success(
                                    wasAdded 
                                      ? `${item.name} added to wishlist` 
                                      : `${item.name} removed from wishlist`
                                  );
                                }}
                                className={cn(
                                  "p-2 rounded-lg transition-all duration-200",
                                  isInWishlist(item.productIds[0])
                                    ? "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
                                    : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                )}
                                title={isInWishlist(item.productIds[0]) ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Heart className={cn("w-4 h-4", isInWishlist(item.productIds[0]) && "fill-current")} />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.clientId, item.name)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Variants */}
                          {(item.size || item.color) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.size && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stock Warning */}
                          {!isOutOfStock && availableStock <= 5 && (
                            <div className="flex items-center gap-1 mt-3 text-xs text-amber-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Only {availableStock} left in stock</span>
                            </div>
                          )}

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.clientId, item.quantity - 1, item.name)}
                                disabled={item.quantity <= 1 || isOutOfStock}
                                className="p-2.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-4 text-sm font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.clientId, item.quantity + 1, item.name)}
                                disabled={item.quantity >= availableStock || isOutOfStock}
                                className="p-2.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-lg text-foreground">
                                {formatCurrency(item.totalPrice)}
                              </span>
                              {item.quantity > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(item.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove button - always visible for out of stock items */}
                        {isOutOfStock && (
                          <div className="absolute top-4 right-4 z-20">
                            <button
                              onClick={() => handleRemoveItem(item.clientId, item.name)}
                              className="p-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-md"
                              title="Remove out-of-stock item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Info Banner */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground">
                Order now for estimated delivery by <strong>{getEstimatedDelivery()}</strong>
              </span>
            </div>

            {/* Continue Shopping Link */}
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="lg:sticky lg:top-24">
              
              {/* User Account Card */}
              {user ? (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.user_metadata?.full_name || 'Welcome!'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Go to profile"
                    >
                      <User className="w-5 h-5 text-primary" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
                  {/* Guest Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email for Order Updates
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  
                  {/* Sign in suggestion */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Have an account? Sign in to save addresses & track orders easily.
                    </p>
                    <div className="flex gap-3">
                      <Link 
                        href="/sign-in?redirect=/cart"
                        className="flex-1 py-2 px-4 border border-border rounded-lg font-medium text-xs text-center hover:bg-muted transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/sign-up"
                        className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-xs text-center hover:bg-primary/90 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <h3 className="font-medium mb-4 flex items-center gap-2 text-foreground">
                  <Package className="w-5 h-5 text-primary" />
                  Shipping Address
                </h3>
                
                {/* Loading state */}
                {isLoadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : savedAddresses.length > 0 && !showAddressForm ? (
                  /* Saved addresses selector */
                  <div className="space-y-4">
                    {/* Selected Address Display */}
                    <button
                      onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                      className="w-full text-left p-4 border border-border rounded-lg hover:border-primary/40 transition-colors"
                    >
                      {selectedAddress ? (
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = getAddressTypeIcon(selectedAddress.type);
                            return (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                            );
                          })()}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{selectedAddress.label}</span>
                              {selectedAddress.is_default && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {selectedAddress.street}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {selectedAddress.city}, {selectedAddress.emirate}
                            </p>
                          </div>
                          <ChevronDown className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform",
                            isAddressDropdownOpen && "rotate-180"
                          )} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select an address</span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {isAddressDropdownOpen && (
                      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-lg animate-fade-in">
                        {savedAddresses.map((addr) => {
                          const Icon = getAddressTypeIcon(addr.type);
                          const isSelected = addr.id === selectedAddressId;
                          return (
                            <button
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setIsAddressDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0",
                                isSelected && "bg-primary/5"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}>
                                {isSelected ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{addr.label}</span>
                                  {addr.is_default && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {addr.street}, {addr.city}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Add new address link */}
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1.5 py-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Use a different address
                    </button>
                  </div>
                ) : (
                  /* Address form for new address or no saved addresses */
                  <div>
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to saved addresses
                      </button>
                    )}
                    <ShippingAddressForm onSave={handleAddressSave} />
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <h3 className="font-medium mb-4 text-foreground">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cart.items.length} items)</span>
                    <span className="font-medium">{formatCurrency(cart.items.reduce((acc, item) => acc + item.totalPrice, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={cn("font-medium", cart.shippingPrice === 0 && "text-primary")}>
                      {cart.shippingPrice === 0 ? "Free" : formatCurrency(cart.shippingPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(cart.taxPrice || 0)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code" 
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isApplyingPromo ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">Total</span>
                    <span className="font-semibold text-2xl text-primary">{formatCurrency(cart.totalPrice || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <h3 className="font-medium mb-4 text-foreground">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    disabled
                    className="flex flex-col items-center justify-center p-4 border border-border rounded-lg opacity-50 cursor-not-allowed bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground">Card Payment</span>
                    <span className="text-[10px] text-muted-foreground/70 mt-1">Coming Soon</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CashOnDelivery')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200",
                      cart.paymentMethod === 'CashOnDelivery'
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <Banknote className={cn(
                      "w-6 h-6 mb-2",
                      cart.paymentMethod === 'CashOnDelivery' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      cart.paymentMethod === 'CashOnDelivery' ? "text-primary" : "text-muted-foreground"
                    )}>
                      Cash on Delivery
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                disabled={
                  isCheckingOut || 
                  cart.items.length === 0 || 
                  cart.paymentMethod !== 'CashOnDelivery' ||
                  hasOutOfStockItems ||
                  isValidatingStock
                }
                className={cn(
                  "w-full py-4 rounded-xl font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "btn-hover-lift"
                )}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : hasOutOfStockItems ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Remove Out-of-Stock Items
                  </>
                ) : isValidatingStock ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking Stock...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Free shipping on orders over AED 100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                  <span>30-day hassle-free returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="sticky-bottom-mobile">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-semibold text-xl">{formatCurrency(cart.totalPrice || 0)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={
              isCheckingOut || 
              cart.items.length === 0 || 
              cart.paymentMethod !== 'CashOnDelivery' ||
              hasOutOfStockItems ||
              isValidatingStock
            }
            className={cn(
              "flex-1 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isCheckingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
