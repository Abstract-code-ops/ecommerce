'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/hooks/useCartStore'
import useWishlistStore from '@/lib/hooks/useWishlistStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Trash2, Plus, Minus, ShoppingBag,
  ChevronRight, Shield, Truck, RotateCcw,
  Clock, Heart, AlertCircle,
  MapPin, Home, Building2, Loader2,
  ArrowLeft, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import OrderReceipt from '@/components/cart/order-receipt'
import ReceiptModal from '@/components/cart/receipt-modal'
import CouponInput from '@/components/shared/coupon-input'
import { getAddresses, createAddress } from '@/lib/actions/address.actions'
import { createOrder, validateCartStock } from '@/lib/actions/order.actions'
import { Address, ShippingAddressSnapshot, ProductSnapshot } from '@/types/supabase'
import { cn } from '@/lib/utils'
import type { Coupon } from '@/lib/actions/coupon.actions'

const CartPage = () => {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart, setPaymentMethod, setShippingAddress } = useCartStore();
  const { items: wishlistItems, toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Address state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const prevCartLengthRef = useRef(cart.items.length);
  
  // Guest checkout state
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  
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
  
  // Receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    address: {
      fullName: string;
      street: string;
      city: string;
      emirate: string;
      country: string;
      lat?: number;
      lng?: number;
    } | null;
    couponCode: string;
    paymentMethod: 'CashOnDelivery' | 'Card';
  }>({
    fullName: '',
    email: '',
    phone: '',
    address: null,
    couponCode: '',
    paymentMethod: 'CashOnDelivery',
  });
  
  // Track if addresses have been fetched to prevent duplicate calls on tab focus
  const addressesFetchedRef = useRef(false);

  // Fetch saved addresses when user is logged in (only once)
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthLoading) return; // Wait for auth to finish loading

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

  // Auto-populate receipt data when user or addresses change
  useEffect(() => {
    if (user) {
      setReceiptData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName,
        email: user.email || prev.email,
        phone: user.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user]);

  // Auto-populate receipt address when selected address changes
  useEffect(() => {
    if (selectedAddress) {
      setReceiptData(prev => ({
        ...prev,
        address: {
          fullName: selectedAddress.full_name,
          street: selectedAddress.street,
          city: selectedAddress.city,
          emirate: selectedAddress.emirate,
          country: selectedAddress.country || 'UAE',
          lat: selectedAddress.lat || undefined,
          lng: selectedAddress.lng || undefined,
        },
      }));
    }
  }, [selectedAddress]);

  useEffect(() => {
    const syncShipping = async () => {
      // 1. Identify the Source of Truth for the address
      const activeAddress = user && selectedAddress 
        ? {
            fullName: selectedAddress.full_name,
            street: selectedAddress.street,
            city: selectedAddress.city,
            emirate: selectedAddress.emirate,
            country: selectedAddress.country || 'UAE',
            lat: selectedAddress.lat,
            lng: selectedAddress.lng,
          } 
        : guestAddress;

      // 2. Bail if requirements aren't met
      if (!activeAddress?.lat || !activeAddress?.lng || cart.items.length === 0) {
        return;
      }

      // 3. REF-CHECK: Prevent redundant calls on tab focus or cart quantity changes
      // Only proceed if the location is actually different from what's in the store
      const isSameLocation = 
        cart.shippingAddress?.lat === activeAddress.lat && 
        cart.shippingAddress?.lng === activeAddress.lng;

      // However, if cart length changed, we might need a recalculation even for the same location
      // We can use a ref to track the last calculated cart length
      if (isSameLocation && prevCartLengthRef.current === cart.items.length) {
        return;
      }

      setIsCalculatingShipping(true);
      
      try {
        await setShippingAddress(activeAddress);
        prevCartLengthRef.current = cart.items.length;
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    syncShipping();
    
    // Dependencies: Use primitive IDs/Values rather than objects to avoid reference-loops
  }, [
    selectedAddressId, 
    guestAddress?.lat, 
    guestAddress?.lng, 
    cart.items.length, 
    user?.id
  ]);

  // Stock validation state
  const [stockStatus, setStockStatus] = useState<Map<string, { isAvailable: boolean; availableStock: number }>>(new Map())
  const [isValidatingStock, setIsValidatingStock] = useState(false)
  const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false)
  
  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  
  // Calculate discount when coupon is applied or cart changes
  useEffect(() => {
    if (appliedCoupon && cart.items.length > 0) {
      const subtotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0)
      
      let discount = 0
      if (appliedCoupon.discount_type === 'percentage') {
        discount = (subtotal * appliedCoupon.discount_value) / 100
        // Apply max discount cap if set
        if (appliedCoupon.max_discount_amount && discount > appliedCoupon.max_discount_amount) {
          discount = appliedCoupon.max_discount_amount
        }
      } else {
        // Fixed discount
        discount = appliedCoupon.discount_value
      }
      
      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal)
      setDiscountAmount(discount)
    } else {
      setDiscountAmount(0)
    }
  }, [appliedCoupon, cart.items])

  const handleCouponApply = (coupon: Coupon) => {
    setAppliedCoupon(coupon)
    setReceiptData(prev => ({
      ...prev,
      couponCode: coupon.code
    }))
    toast.success(`Coupon applied! You saved ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}`)
  }

  const handleCouponRemove = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setReceiptData(prev => ({
      ...prev,
      couponCode: ''
    }))
  }

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
    // Validation using receiptData
    if (receiptData.paymentMethod !== 'CashOnDelivery') {
      toast.error('Please select Cash on Delivery as payment method');
      setIsReceiptModalOpen(true);
      return;
    }

    if (!receiptData.address) {
      toast.error('Please complete the receipt with your shipping address');
      setIsReceiptModalOpen(true);
      return;
    }

    // Require email and name
    if (!receiptData.email) {
      toast.error('Please enter your email address');
      setIsReceiptModalOpen(true);
      return;
    }

    if (!receiptData.fullName) {
      toast.error('Please enter your full name');
      setIsReceiptModalOpen(true);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiptData.email)) {
      toast.error('Please enter a valid email address');
      setIsReceiptModalOpen(true);
      return;
    }

    // Use receiptData.address for shipping
    const shippingAddress: ShippingAddressSnapshot = receiptData.address;

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
        discount: discountAmount,
        paymentMethod: 'CashOnDelivery',
        guestEmail: !user ? receiptData.email : undefined,
        couponCode: appliedCoupon?.code,
      });

      if (result.success && result.data) {
        clearCart();
        toast.success('Order placed successfully!');
        
        // Redirect to success page with order details
        const params = new URLSearchParams({
          orderNumber: result.data.orderNumber,
          guest: result.data.isGuest.toString(),
        });
        
        // Add email for guest users
        if (result.data.isGuest && receiptData.email) {
          params.append('email', receiptData.email);
        }
        
        router.push(`/checkout/success?${params.toString()}`);
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

  // Calculate estimated delivery date (5-7 business days from now)
  const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date();
    end.setDate(end.getDate() + 10);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Empty cart state
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#F9FAF7]">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#F4F5F2] flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-[#5A6B5E]/60" strokeWidth={1.5} />
          </div>
          <h1 className="font-bold text-3xl md:text-4xl mb-4 text-[#1B3022]">Your Cart is Empty</h1>
          <p className="text-[#5A6B5E] mb-8">
            Looks like you haven&apos;t added anything to your cart yet. Explore our collection to find something special.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#9DBE91] text-white rounded-full font-medium hover:bg-[#8AAE7E] transition-colors btn-hover-lift"
          >
            Start Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAF7] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/shop" 
              className="p-2 hover:bg-[#F4F5F2] rounded-full transition-colors"
              aria-label="Back to shop"
            >
              <ArrowLeft className="w-5 h-5 text-[#5A6B5E]" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl text-[#1B3022]">Shopping Cart</h1>
              <p className="text-sm text-[#5A6B5E] mt-1">
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
              <div className="flex items-center gap-2 text-sm text-[#5A6B5E] bg-[#F4F5F2]/50 rounded-lg px-4 py-3 animate-pulse">
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
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="p-4 md:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <span className="font-medium text-[#1B3022]">Cart Items</span>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-[#5A6B5E] hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-[#E5E7EB]">
                {cart.items.map((item) => {
                  const itemStock = stockStatus.get(item.productIds[0])
                  const isOutOfStock = itemStock && !itemStock.isAvailable
                  const availableStock = itemStock?.availableStock ?? item.countInStock
                  
                  return (
                    <div 
                      key={item.clientId}
                      className={cn(
                        "p-4 md:p-6 transition-all duration-300 relative",
                        isOutOfStock ? "bg-[#F4F5F2]/50" : "hover:bg-[#F4F5F2]/30"
                      )}
                    >
                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-[#F9FAF7]/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
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
                            "relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-[#F4F5F2] group",
                            isOutOfStock && "opacity-50"
                          )}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 96px, 128px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className={cn("flex-1 min-w-0", isOutOfStock && "opacity-50")}>
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 space-y-1">
                              <Link 
                                href={`/shop/products/${item.slug}`}
                                className="font-medium text-[#1B3022] hover:text-[#9DBE91] transition-colors line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              {item.category && (
                                <p className="text-xs text-[#5A6B5E]">{item.category}</p>
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
                                    : "text-[#5A6B5E] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                )}
                                title={isInWishlist(item.productIds[0]) ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Heart className={cn("w-4 h-4", isInWishlist(item.productIds[0]) && "fill-current")} />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.clientId, item.name)}
                                className="p-2 text-[#5A6B5E] hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
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
                                <span className="text-xs bg-[#F4F5F2] text-[#5A6B5E] px-2 py-1 rounded">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-xs bg-[#F4F5F2] text-[#5A6B5E] px-2 py-1 rounded">
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
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                            <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.clientId, item.quantity - 1, item.name)}
                                disabled={item.quantity <= 1 || isOutOfStock}
                                className="p-2.5 hover:bg-[#F4F5F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-4 text-sm font-medium min-w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.clientId, item.quantity + 1, item.name)}
                                disabled={item.quantity >= availableStock || isOutOfStock}
                                className="p-2.5 hover:bg-[#F4F5F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="font-semibold text-lg text-[#1B3022]">
                                {formatCurrency(item.totalPrice)}
                              </span>
                              {item.quantity > 1 && (
                                <p className="text-xs text-[#5A6B5E]">
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
            <div className="flex items-center gap-3 p-4 bg-[#9DBE91]/5 border border-[#9DBE91]/10 rounded-xl text-sm">
              <Clock className="w-5 h-5 text-[#9DBE91] shrink-0" />
              <span className="text-[#1B3022]">
                Order now for estimated delivery by <strong>{getEstimatedDelivery()}</strong>
              </span>
            </div>

            {/* Continue Shopping Link */}
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 text-sm text-[#5A6B5E] hover:text-[#9DBE91] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="lg:sticky lg:top-24">
              
              {/* Coupon Input */}
              <div className="mb-4">
                <CouponInput
                  subtotal={cart.items.reduce((acc, item) => acc + item.totalPrice, 0)}
                  onApply={handleCouponApply}
                  onRemove={handleCouponRemove}
                  appliedCoupon={appliedCoupon}
                />
              </div>
              
              {/* Order Receipt */}
              <OrderReceipt
                receiptData={receiptData}
                subtotal={cart.items.reduce((acc, item) => acc + item.totalPrice, 0)}
                shippingCost={cart.shippingPrice || 0}
                discount={discountAmount}
                total={(cart.items.reduce((acc, item) => acc + item.totalPrice, 0) + (cart.shippingPrice || 0)) - discountAmount}
                itemCount={cart.items.length}
                isComplete={!!(receiptData.fullName && receiptData.email && receiptData.address && receiptData.paymentMethod)}
                onEditClick={() => setIsReceiptModalOpen(true)}
                isCalculatingShipping={isCalculatingShipping}
              />

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                disabled={
                  isCheckingOut || 
                  cart.items.length === 0 || 
                  !receiptData.paymentMethod ||
                  !receiptData.address ||
                  !receiptData.fullName ||
                  !receiptData.email ||
                  hasOutOfStockItems ||
                  isValidatingStock
                }
                className={cn(
                  "w-full py-4 rounded-full font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6",
                  "bg-[#9DBE91] text-white hover:bg-[#8AAE7E]",
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
                ) : !receiptData.address || !receiptData.fullName || !receiptData.email ? (
                  <>
                    <Lock className="w-5 h-5" />
                    Complete Receipt to Order
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
                <div className="flex items-center gap-3 text-sm text-[#5A6B5E]">
                  <Shield className="w-4 h-4 text-[#9DBE91] shrink-0" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#5A6B5E]">
                  <Truck className="w-4 h-4 text-[#9DBE91] shrink-0" />
                  <span>Free shipping on orders over AED 100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#5A6B5E]">
                  <RotateCcw className="w-4 h-4 text-[#9DBE91] shrink-0" />
                  <span>30-day hassle-free returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onComplete={(data) => {
          setReceiptData(data);
          setPaymentMethod(data.paymentMethod);
          if (data.address) {
            setShippingAddress(data.address);
            if (!user) {
              setGuestAddress(data.address);
            }
          }
          if (!user) {
            setGuestEmail(data.email);
            setGuestName(data.fullName);
          }
        }}
        initialData={receiptData}
        shippingCost={cart.shippingPrice || 0}
        isCalculatingShipping={isCalculatingShipping}
        onAddressChange={(address) => {
          if (address) {
            setShippingAddress(address);
            if (!user) {
              setGuestAddress(address);
            }
          }
        }}
        isAuthenticated={!!user}
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name}
        savedAddresses={savedAddresses}
      />

      {/* Mobile Sticky Checkout Bar */}
      <div className="sticky-bottom-mobile">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#5A6B5E]">Total</span>
            <span className="font-semibold text-xl">{formatCurrency(cart.totalPrice || 0)}</span>
          </div>
          <button 
            onClick={() => {
              if (!receiptData.address || !receiptData.fullName || !receiptData.email) {
                setIsReceiptModalOpen(true);
              } else {
                handleCheckout();
              }
            }}
            disabled={
              isCheckingOut || 
              cart.items.length === 0 || 
              cart.paymentMethod !== 'CashOnDelivery' ||
              hasOutOfStockItems ||
              isValidatingStock
            }
            className={cn(
              "flex-1 py-3.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2",
              "bg-[#9DBE91] text-white hover:bg-[#8AAE7E]",
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
