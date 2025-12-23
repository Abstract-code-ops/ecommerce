'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/hooks/useCartStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Trash2, Plus, Minus, ShoppingBag, Banknote, 
  ChevronRight, Shield, Truck, RotateCcw, Tag, 
  Clock, Package, Heart, AlertCircle, User, LogIn,
  MapPin, Check, ChevronDown, Home, Building2, Loader2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'react-toastify'
import ShippingAddressForm from '@/components/shared/shipping-address-form'
import { getAddresses, createAddress } from '@/lib/actions/address.actions'
import { createOrder, validateCartStock } from '@/lib/actions/order.actions'
import { Address, ShippingAddressSnapshot, ProductSnapshot } from '@/types/supabase'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CartPage = () => {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart, setPaymentMethod } = useCartStore();
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
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/sign-in?redirect=/cart');
      return;
    }

    if (cart.paymentMethod !== 'CashOnDelivery') {
      toast.error('Please select Cash on Delivery as payment method');
      return;
    }

    const shippingAddress = getCheckoutAddress();
    if (!shippingAddress) {
      toast.error('Please select or add a shipping address');
      return;
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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground/90">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-sm mb-2">
            Thank you for your order. Your order number is:
          </p>
          <p className="font-mono text-lg font-semibold text-primary mb-6">
            {checkoutSuccess.orderNumber}
          </p>
          <p className="text-muted-foreground text-xs mb-6">
            You&apos;ll pay <strong>Cash on Delivery</strong> when your order arrives.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/profile/orders">View Orders</Link>
            </Button>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground/90">Your cart is empty</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 animate-in fade-in-0 slide-in-from-left-2 duration-300">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground/90">Shopping Cart</h1>
          <span className="text-xs md:text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <button
          onClick={handleClearCart}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors duration-200"
        >
          Clear all
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-150">
          {/* Stock validation loading indicator */}
          {isValidatingStock && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking stock availability...
            </div>
          )}
          
          {/* Out of stock warning banner */}
          {hasOutOfStockItems && !isValidatingStock && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-lg text-xs md:text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Some items in your cart are out of stock. Please remove them to proceed.</span>
            </div>
          )}
          
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            {cart.items.map((item, index) => {
              const itemStock = stockStatus.get(item.productIds[0])
              const isOutOfStock = itemStock && !itemStock.isAvailable
              const availableStock = itemStock?.availableStock ?? item.countInStock
              
              return (
                <React.Fragment key={item.clientId}>
                  <div className={`p-4 transition-colors duration-200 relative ${isOutOfStock ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2">
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
                    
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/shop/products/${item.slug}`} className="shrink-0">
                        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-muted/50 group ${isOutOfStock ? 'opacity-50' : ''}`}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className={`flex-1 min-w-0 ${isOutOfStock ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <Link 
                              href={`/shop/products/${item.slug}`}
                              className="font-medium text-sm md:text-base text-foreground/90 hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1.5 text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-50 rounded transition-all duration-200"
                              title="Save for later"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.clientId, item.name)}
                              className="p-1.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded transition-all duration-200"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Variants */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.size && (
                            <span className="text-[10px] md:text-xs bg-muted/70 text-muted-foreground px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] md:text-xs bg-muted/70 text-muted-foreground px-2 py-0.5 rounded">
                              Color: {item.color}
                            </span>
                          )}
                        </div>

                        {/* Stock Warning */}
                        {!isOutOfStock && availableStock <= 5 && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] md:text-xs text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Only {availableStock} left in stock</span>
                          </div>
                        )}

                        {/* Quantity & Total */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-border/60 rounded-md overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item.clientId, item.quantity - 1, item.name)}
                              disabled={item.quantity <= 1 || isOutOfStock}
                              className="p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-sm font-medium min-w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.clientId, item.quantity + 1, item.name)}
                              disabled={item.quantity >= availableStock || isOutOfStock}
                              className="p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-semibold text-sm md:text-base text-foreground/90">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Remove button - always visible for out of stock items */}
                      {isOutOfStock && (
                        <div className="absolute top-4 right-4 z-20">
                          <button
                            onClick={() => handleRemoveItem(item.clientId, item.name)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                            title="Remove out-of-stock item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < cart.items.length - 1 && <Separator className="bg-border/40" />}
                </React.Fragment>
              )
            })}
          </div>

          {/* Estimated Delivery Banner */}
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg text-xs md:text-sm text-emerald-700 dark:text-emerald-400 animate-in fade-in-0 duration-500 delay-300">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Order now for estimated delivery by <strong>{getEstimatedDelivery()}</strong>
            </span>
          </div>

          {/* Continue Shopping Link */}
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
          {/* User Account Card */}
          {user ? (
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user.user_metadata?.full_name || 'Welcome!'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link 
                  href="/profile" 
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Go to profile"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Sign in for a better experience</p>
                  <p className="text-xs text-muted-foreground">Save addresses & track orders</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href="/sign-in?redirect=/cart">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-foreground/90">
              <Package className="w-4 h-4 text-muted-foreground" />
              Shipping Address
            </h3>
            
            {/* Loading state */}
            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : savedAddresses.length > 0 && !showAddressForm ? (
              /* Saved addresses selector */
              <div className="space-y-3">
                {/* Selected Address Display */}
                <button
                  onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                  className="w-full text-left p-3 border border-border/60 rounded-lg hover:border-primary/40 transition-colors"
                >
                  {selectedAddress ? (
                    <div className="flex items-start gap-3">
                      {(() => {
                        const Icon = getAddressTypeIcon(selectedAddress.type);
                        return (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{selectedAddress.label}</span>
                          {selectedAddress.is_default && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {selectedAddress.street}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedAddress.city}, {selectedAddress.emirate}
                        </p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Select an address</span>
                  )}
                </button>

                {/* Dropdown */}
                {isAddressDropdownOpen && (
                  <div className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-lg">
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
                          className={`w-full text-left p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0 ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{addr.label}</span>
                              {addr.is_default && (
                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
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
                  className="w-full text-xs text-primary hover:underline flex items-center justify-center gap-1 py-2"
                >
                  <Plus className="w-3 h-3" />
                  Use a different address
                </button>
              </div>
            ) : (
              /* Address form for new address or no saved addresses */
              <div>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs text-muted-foreground hover:text-primary mb-3 flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    Back to saved addresses
                  </button>
                )}
                <ShippingAddressForm onSave={handleAddressSave} />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4 text-foreground/90">Order Summary</h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.items.reduce((acc, item) => acc + item.totalPrice, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={cart.shippingPrice === 0 ? "text-emerald-600" : ""}>
                  {cart.shippingPrice === 0 ? "Free" : formatCurrency(cart.shippingPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(cart.taxPrice || 0)}</span>
              </div>
            </div>

            <Separator className="my-3 bg-border/40" />

            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span className="text-lg text-primary">{formatCurrency(cart.totalPrice || 0)}</span>
            </div>

            {/* Promo Code */}
            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code" 
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                >
                  {isApplyingPromo ? '...' : 'Apply'}
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 text-foreground/90">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('Card')}
                disabled
                className="flex flex-col items-center justify-center p-3 border border-border/50 rounded-lg opacity-50 cursor-not-allowed bg-muted/30"
              >
                <span className="text-[10px] text-muted-foreground">Card</span>
                <span className="text-[9px] text-muted-foreground/70 mt-0.5">Coming Soon</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CashOnDelivery')}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 ${
                  cart.paymentMethod === 'CashOnDelivery'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <Banknote className={`w-5 h-5 mb-1 ${cart.paymentMethod === 'CashOnDelivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] ${cart.paymentMethod === 'CashOnDelivery' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  Cash on Delivery
                </span>
              </button>
            </div>
          </div>

          {/* Checkout Button */}
          <Button 
            className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            onClick={handleCheckout}
            disabled={
              isCheckingOut || 
              cart.items.length === 0 || 
              cart.paymentMethod !== 'CashOnDelivery' ||
              hasOutOfStockItems ||
              isValidatingStock
            }
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : hasOutOfStockItems ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Remove Out-of-Stock Items
              </>
            ) : isValidatingStock ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Stock...
              </>
            ) : (
              'Place Order (Cash on Delivery)'
            )}
          </Button>

          {/* Trust Badges */}
          {/* <div className="bg-muted/30 border border-border/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Secure SSL encrypted checkout</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>30-day hassle-free returns</span>
            </div>
          </div> */}

          {/* Payment Methods Badge */}
          {/* <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-[10px] text-muted-foreground/70">We accept:</span>
            <div className="flex gap-1.5">
              <div className="px-2 py-0.5 bg-[#1a1f71] rounded text-white text-[8px] font-bold">VISA</div>
              <div className="px-2 py-0.5 bg-[#eb001b] rounded text-white text-[8px] font-bold">MC</div>
              <div className="px-2 py-0.5 bg-[#006fcf] rounded text-white text-[8px] font-bold">AMEX</div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default CartPage