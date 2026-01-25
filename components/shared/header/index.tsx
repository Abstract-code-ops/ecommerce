"use client";
import { useEffect, useState, useRef } from "react";
import { App_NAME } from "@/lib/constants";
import Link from "next/link";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import { MenuIcon, X, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Ref to the original header and sticky state
  const headerRef = useRef<HTMLElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Announcement bar text
  const announcementText = "Free shipping on orders over AED 250 • Crafted with love";

  return (
    <>
      {/* Sticky header */}
      <div
        aria-hidden={!showSticky}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          showSticky
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-full"
        )}
      >
        {/* Sticky Header Content */}
        <div className="bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="container-premium">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link
                href="/shop"
                className="flex items-center gap-2 group"
              >
                <Image
                  src="/images/logo-small.png"
                  alt={App_NAME}
                  width={36}
                  height={36}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="font-serif text-lg text-foreground tracking-tight">{App_NAME}</span>
              </Link>

              {/* Center Nav - Desktop */}
              <nav className="hidden lg:flex items-center gap-8">
                {data.headerMenus.map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 animate-underline py-1"
                  >
                    {menu.name}
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className="hidden md:flex p-2 hover:bg-muted rounded-full transition-colors duration-200"
                  aria-label="Toggle search"
                >
                  <SearchIcon className="w-5 h-5 text-foreground/70" />
                </button>
                <div className="hidden md:block">
                  <Menu />
                </div>
                <button
                  type="button"
                  aria-expanded={mobileOpen}
                  aria-label="Toggle navigation"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="md:hidden p-2 hover:bg-muted rounded-full transition-colors duration-200"
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
              <Search className="w-full max-w-2xl mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Original header */}
      <header ref={headerRef} className="relative">
        {/* Announcement Bar */}
        <div className="bg-primary text-primary-foreground">
          <div className="container-premium">
            <div className="flex items-center justify-center h-10 overflow-hidden">
              <p className="text-xs md:text-sm tracking-wide animate-pulse-soft">
                {announcementText}
              </p>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={cn(
          "bg-background transition-all duration-300",
          isScrolled ? "shadow-sm" : ""
        )}>
          <div className="container-premium">
            {/* Top Row - Logo, Search, Actions */}
            <div className="flex items-center justify-between py-4 md:py-6">
              {/* Mobile Menu Button */}
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden p-2 -ml-2 hover:bg-muted rounded-full transition-colors duration-200"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>

              {/* Logo - Centered on mobile */}
              <Link
                href="/shop"
                className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0"
              >
                <Image
                  src="/images/logo-small.png"
                  alt={App_NAME}
                  width={48}
                  height={48}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <span className="hidden sm:block font-serif text-xl md:text-2xl text-foreground tracking-tight">
                  {App_NAME}
                </span>
              </Link>

              {/* Search - Desktop */}
              <div className="hidden md:block flex-1 max-w-xl mx-8">
                <Search className="w-full" />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Search Icon - Mobile */}
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className="md:hidden p-2 hover:bg-muted rounded-full transition-colors duration-200"
                  aria-label="Toggle search"
                >
                  <SearchIcon className="w-5 h-5 text-foreground/70" />
                </button>
                <div className="hidden md:block">
                  <Menu />
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

          {/* Navigation Bar - Desktop */}
          <nav className="hidden md:block border-t border-border/50 bg-primary">
            <div className="container-premium">
              <div className="flex items-center justify-center gap-8 h-12">
                {data.headerMenus.map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className="text-sm font-medium text-primary-foreground hover:text-foreground transition-colors duration-200 animate-underline py-1"
                  >
                    {menu.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          aria-hidden={!mobileOpen}
          className={cn(
            "md:hidden fixed inset-0 z-50 transition-all duration-300",
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
              "absolute top-0 left-0 h-full w-[85%] max-w-sm bg-background shadow-2xl transition-transform duration-300 ease-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo-small.png"
                  alt={App_NAME}
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="font-serif text-lg">{App_NAME}</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
              {/* Navigation Links */}
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {data.headerMenus.map((menu, index) => (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {menu.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-border bg-muted/30">
                <Menu layout="mobile" onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}