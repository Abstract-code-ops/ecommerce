"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import { MenuIcon, X, Search as SearchIcon, User, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import useCartStore from "@/lib/hooks/useCartStore";
import useWishlistStore from "@/lib/hooks/useWishlistStore";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { cart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  // Ref to the original header and sticky state
  const headerRef = useRef<HTMLElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = mounted ? wishlistItems.length : 0;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("resize", handleResize);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen]);

  // Optimized scroll listener with throttling
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = headerRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          setShowSticky(rect.bottom <= 0);
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Announcement bar text (scrolling ticker)
  const announcementText = "Free shipping on orders over AED 250 • Crafted with love";

  // Category links for Tier 3
  const categoryLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/shop/products" },
    { name: "Best Sellers", href: "/shop/products?tag=best-seller" },
    { name: "Deals & Offers", href: "/shop/products?deals=true" },
    { name: "Browsing History", href: "/shop#browsing-history" },
    { name: "Track Order", href: "/profile/orders" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Sticky header - simplified for scroll */}
      <div
        aria-hidden={!showSticky}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          showSticky
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-full"
        )}
      >
        <div className="bg-[#F9FAF7]/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm">
          <div className="container-premium">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/shop" className="flex items-center gap-2 group">
                <Image
                  src="/images/logo-full.png"
                  alt="Global Edge"
                  width={200}
                  height={62}
                  className="h-12 w-auto"
                  priority
                />
              </Link>

              {/* Center Nav - Desktop */}
              <nav className="hidden lg:flex items-center gap-8">
                {categoryLinks.slice(0, 5).map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className="text-sm font-medium text-[#1B3022]/80 hover:text-[#1B3022] transition-colors duration-200 uppercase tracking-wide"
                  >
                    {menu.name}
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className="hidden md:flex p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                  aria-label="Toggle search"
                >
                  <SearchIcon className="w-5 h-5 text-[#1B3022]/70" />
                </button>
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/profile/wishlist" className="relative p-2 hover:bg-[#F4F5F2] rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-[#1B3022]" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#9DBE91] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/cart" className="relative p-2 hover:bg-[#F4F5F2] rounded-full transition-colors">
                    <ShoppingBag className="w-5 h-5 text-[#1B3022]" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#9DBE91] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>
                <button
                  type="button"
                  aria-expanded={mobileOpen}
                  aria-label="Toggle navigation"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="md:hidden p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Search Bar */}
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              searchExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
            )}
          >
            <div className="container-premium pb-4">
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <Search className="flex-1" />
                <button
                  onClick={() => setSearchExpanded(false)}
                  className="p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200 shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-[#1B3022]/70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original 3-Tier Header */}
      <header ref={headerRef} className="relative">
        {/* ==================== TIER 1: Utility Bar ==================== */}
        <div className="bg-[#1B3022] text-white">
          <div className="container-premium">
            <div className="flex items-center justify-between h-10">
              {/* Left: Scrolling ticker */}
              <div className="flex-1 overflow-hidden">
                <p className="text-xs md:text-sm tracking-wide whitespace-nowrap animate-pulse-soft">
                  {announcementText}
                </p>
              </div>
              
              {/* Right: Utility links */}
              <div className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide">
                <Link href="/profile/returns" className="hover:text-[#9DBE91] transition-colors">
                  Shipping & Returns
                </Link>
                <Link href="/profile/orders" className="hover:text-[#9DBE91] transition-colors">
                  Track Orders
                </Link>
                <Link href="/profile" className="hover:text-[#9DBE91] transition-colors">
                  My Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TIER 2: Branding & Action ==================== */}
        <div className={cn(
          "bg-[#F9FAF7] border-b border-[#E5E7EB] transition-all duration-300",
          isScrolled ? "shadow-sm" : ""
        )}>
          <div className="container-premium">
            <div className="flex items-center justify-between py-4 md:py-5 gap-4 md:gap-8">
              {/* Mobile Menu Button */}
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden p-2 -ml-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
              >
                {mobileOpen ? <X className="w-5 h-5 text-[#1B3022]" /> : <MenuIcon className="w-5 h-5 text-[#1B3022]" />}
              </button>

              {/* Left: Logo */}
              <Link
                href="/shop"
                className="flex items-center gap-3 group shrink-0"
              >
                <Image
                  src="/images/logo-full.png"
                  alt="Global Edge"
                  width={220}
                  height={68}
                  className="h-14 md:h-16 w-auto"
                  priority
                />
              </Link>

              {/* Center: Wide Search Bar with Category Dropdown */}
              <div className="hidden md:block flex-1 max-w-2xl">
                <Search className="w-full" showCategoryDropdown />
              </div>

              {/* Right: Auth Buttons */}
              <div className="flex items-center gap-3">
                {/* Mobile Search Icon */}
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className="md:hidden p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                  aria-label="Toggle search"
                >
                  <SearchIcon className="w-5 h-5 text-[#1B3022]/70" />
                </button>
                
                {/* Desktop Auth */}
                <div className="hidden md:block">
                  <Menu layout="header-auth" />
                </div>
                
                {/* Mobile Cart Only */}
                <div className="md:hidden">
                  <Menu layout="mobile-cart-only" />
                </div>
              </div>
            </div>

            {/* Mobile Search Expandable */}
            <div
              className={cn(
                "md:hidden transition-all duration-300 ease-out",
                searchExpanded ? "max-h-20 opacity-100 pb-4" : "max-h-0 opacity-0 overflow-hidden"
              )}
            >
              <Search className="w-full" onSubmit={() => setSearchExpanded(false)} />
            </div>
          </div>
        </div>

        {/* ==================== TIER 3: Category Links ==================== */}
        <nav className="hidden md:block bg-[#F9FAF7] border-b border-[#E5E7EB]">
          <div className="container-premium">
            <div className="flex items-center justify-between h-12">
              {/* Center: Category Links */}
              <div className="flex-1 flex items-center justify-center gap-6 lg:gap-8">
                {categoryLinks.map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className="text-sm font-medium text-[#1B3022] hover:text-[#9DBE91] transition-colors duration-200 tracking-wide uppercase whitespace-nowrap"
                  >
                    {menu.name}
                  </Link>
                ))}
              </div>

              {/* Right: Icon Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href="/profile"
                  className="p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                  title="Account"
                >
                  <User className="w-5 h-5 text-[#1B3022]" />
                </Link>
                <Link
                  href="/profile/wishlist"
                  className="relative p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 text-[#1B3022]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#9DBE91] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-[#F4F5F2] rounded-full transition-colors duration-200"
                  title="Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-[#1B3022]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#9DBE91] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          aria-hidden={!mobileOpen}
          className={cn(
            "md:hidden fixed inset-0 z-40 transition-all duration-300",
            mobileOpen
              ? "pointer-events-auto"
              : "pointer-events-none"
          )}
        >
          {/* Backdrop */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
              mobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <div
            className={cn(
              "absolute top-0 left-0 h-full w-[85%] max-w-sm bg-[#F9FAF7] shadow-2xl transition-transform duration-300 ease-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo-full.png"
                  alt="Global Edge"
                  width={180}
                  height={56}
                  className="h-12 w-auto"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-[#F4F5F2] rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[#1B3022]" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
              {/* Mobile Menu Actions (User/Cart/Auth) */}
              <div className="p-4 border-b border-[#E5E7EB] bg-[#F4F5F2]/50">
                <Menu layout="mobile" onNavigate={() => setMobileOpen(false)} />
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {categoryLinks.map((menu, index) => (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-medium text-[#1B3022] hover:bg-[#F4F5F2] rounded-lg transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {menu.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}