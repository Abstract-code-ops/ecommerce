'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronUp, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'
import { App_NAME } from '@/lib/constants'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/shop/products' },
      { name: 'Paper Bags', href: '/shop/products?category=Paperbags' },
      { name: 'Gift Boxes', href: '/shop/products?category=Gift+Boxes' },
      { name: 'New Arrivals', href: '/shop/products?tag=new' },
      { name: 'Best Sellers', href: '/shop/products?tag=best-seller' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'Track Order', href: '/track-order' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/about#story' },
      { name: 'Sustainability', href: '/sustainability' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Back to Top Button */}
      <div className="border-b border-white/10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/5 transition-colors duration-300 group"
        >
          <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1" />
          <span>Back to top</span>
        </button>
      </div>

      {/* Main Footer Content */}
      <div className="container-premium py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/shop" className="inline-flex items-center gap-3 group">
              <Image
                src="/images/logo-small.png"
                alt={App_NAME}
                width={48}
                height={48}
                className="object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              <span className="font-serif text-2xl">{App_NAME}</span>
            </Link>
            <p className="text-primary-foreground/70 leading-relaxed max-w-sm">
              Premium packaging solutions crafted with care. We believe in sustainable, 
              beautiful products that make a difference.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm tracking-wide uppercase">
                Join Our Newsletter
              </h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm placeholder:text-primary-foreground/50 focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-primary font-medium text-sm rounded-lg hover:bg-white/90 transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-primary-foreground/50">
                Get 10% off your first order when you subscribe.
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-5">
            <h4 className="font-medium text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-5">
            <h4 className="font-medium text-sm tracking-wide uppercase">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-5">
            <h4 className="font-medium text-sm tracking-wide uppercase">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div className="pt-4 space-y-3 text-sm text-primary-foreground/70">
              <a href="mailto:support@globaledgeshop.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                support@globaledgeshop.com
              </a>
              <a href="tel:+905338445788" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +90 533 844 57 88
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-premium py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-primary-foreground/60 text-center md:text-left">
              © {currentYear} {App_NAME}. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Credit */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-primary-foreground/40">
              Crafted with care by GMQG
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer