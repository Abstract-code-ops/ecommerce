'use client'
import { FormEventHandler, useEffect, useState, useRef } from "react";
import { SearchIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { App_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getSearchSuggestions } from "@/lib/actions/product.actions";
import type { IProduct } from "@/lib/db/models/product.model";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const categories = ["All Categories", "Paper Bags", "Plastic Bags", "Gift Boxes", "Wrapping Paper", "Ribbons", "Tape", "Labels"];

type SearchProps = {
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  showCategoryDropdown?: boolean;
};

export default function Search({ className, onSubmit, showCategoryDropdown = false }: SearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [results, setResults] = useState<IProduct[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query) {
        const data = await getSearchSuggestions(query);
        setResults(data);
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/shop/products/${slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form
        action="/shop/products"
        method="GET"
        onSubmit={onSubmit}
        className={cn("flex items-stretch h-12", className)}
      >
        {/* Category Dropdown - Only show if prop is true */}
        {showCategoryDropdown && (
          <div className="hidden lg:flex items-center bg-white border border-r-0 border-[#E5E7EB] rounded-l-xl px-3">
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm text-[#1B3022] font-medium appearance-none cursor-pointer pr-6 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#1B3022]/60 -ml-4 pointer-events-none" />
          </div>
        )}
        
        {/* Search Input */}
        <Input
          className={cn(
            "flex-1 border border-[#E5E7EB] bg-white text-[#1B3022] text-base h-full px-4 focus-visible:ring-[#9DBE91] focus-visible:border-[#9DBE91]",
            showCategoryDropdown ? "lg:border-l-0 lg:rounded-l-none rounded-l-xl" : "rounded-l-xl",
            "rounded-r-none"
          )}
          placeholder={`Search ${App_NAME}...`}
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={(e) => {
            // Only close if clicking outside the dropdown
            if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
              setTimeout(() => setOpen(false), 150);
            }
          }}
          onFocus={() => { if(query) setOpen(true) }}
        />
        
        {/* Sage Green Search Button */}
        <button
          type="submit"
          className="bg-[#9DBE91] hover:bg-[#8AAE7E] text-white rounded-r-xl h-full px-5 cursor-pointer transition-colors duration-200 flex items-center justify-center"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </form>
      
      {/* Search Results Dropdown */}
      {open && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-100 mt-2 max-h-80 overflow-y-auto"
        >
          {results.map((product) => (
            <button
              key={product.slug}
              type="button"
              className="flex items-center gap-3 p-3 hover:bg-[#F4F5F2] transition-colors w-full text-left first:rounded-t-xl last:rounded-b-xl"
              onClick={() => handleResultClick(product.slug)}
            >
              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-[#F4F5F2]">
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                  loading="lazy"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#1B3022]">{product.name}</p>
                <p className="text-xs text-[#5A6B5E]">{product.price} AED</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}