"use client";
import { useEffect, useState, useRef } from "react";
import { App_NAME } from "@/lib/constants";
import Link from "next/link";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import { MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // New: ref to the original header and sticky state
  const headerRef = useRef<HTMLElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

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

  // New: scroll listener to detect when the original header is out of view
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // when bottom <= 0 the header has scrolled fully out of view
      setShowSticky(rect.bottom <= 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      {/* Sticky header that fades/slides in when the original header is out of view */}
      <div
        aria-hidden={!showSticky}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md transition-[opacity,transform] duration-300 ease-in-out",
          showSticky
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-4"
        )}
      >
        <div className="px-2">
          <div className="relative z-50 flex items-center justify-between py-3 px-5">
            <Link
              href="/shop"
              className="flex items-center header-button font-extrabold text-2xl m-1"
            >
              {App_NAME}
            </Link>

            <div className="hidden md:block flex-1 max-w-xl">
              <Search className="w-full" />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <Menu />
              </div>
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden rounded-full p-2 hover:bg-white/10 transition"
              >
                {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          </div>

          {/* ADDED: show the headerMenus in the sticky header (md+ only) */}
          <div className="hidden md:flex justify-center items-center px-3 mb-px bg-secondary">
            <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
              {data.headerMenus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="header-button animate-underline px-2 py-1"
                >
                  {menu.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Original header (kept in flow) */}
      <header ref={headerRef} className="bg-black text-white">
        <div className="px-2">
          <div className="relative z-50 flex items-center justify-between py-3 px-5">
            <Link
              href="/shop"
              className="flex items-center header-button font-extrabold text-2xl m-1"
            >
              {App_NAME}
            </Link>

            <div className="hidden md:block flex-1 max-w-xl">
              <Search className="w-full" />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <Menu />
              </div>
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden rounded-full p-2 hover:bg-white/10 transition"
              >
                {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          </div>

          <div
            aria-hidden={!mobileOpen}
            className={cn(
              "md:hidden fixed inset-0 h-screen bg-black/95 backdrop-blur-sm z-40 transition-[opacity,transform] duration-300 ease-in-out",
              mobileOpen
                ? "pointer-events-auto opacity-100 translate-y-0"
                : "pointer-events-none opacity-0 -translate-y-4"
            )}
          >
            <div className="flex h-full flex-col gap-4 overflow-y-auto px-5 pb-8 pt-24">
              <Search className="w-full" onSubmit={() => setMobileOpen(false)} />
              <nav className="space-y-2">
                {data.headerMenus.map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/20"
                  >
                    {menu.name}
                  </Link>
                ))}
              </nav>
              <Menu layout="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center px-3 mb-px bg-secondary">
          <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
            {data.headerMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="header-button animate-underline px-2 py-1"
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}