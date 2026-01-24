'use client'
import { FormEventHandler, useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
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

const caegories = ["paper bags", "plastic bags", "gift boxes", "wrapping paper", "ribbons", "tape", "labels"];

type SearchProps = {
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export default function Search({ className, onSubmit }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IProduct[]>([]);
  const [open, setOpen] = useState(false);

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

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form
        action="/shop/products"
        method="GET"
        onSubmit={onSubmit}
        className={cn("flex items-stretch h-10", className)}
      >
        {/* <Select name="category">
          <SelectTrigger className="w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none cursor-pointer">
            <SelectValue placeholder="All" className="p-0" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              All categories
            </SelectItem>
            {caegories.map((category) => (
              <SelectItem key={category} value={category} className="cursor-pointer">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <Input
          className="flex-1 rounded-se-none rounded-ee-none dark:border-gray-200 bg-gray-100 text-black text-base h-full"
          placeholder={`Search Site ${App_NAME}`}
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => { if(query) setOpen(true) }}
        />
        <button
          type="submit"
          className="bg-secondary text-white rounded-se-none rounded-e-md h-full px-3 py-2 cursor-pointer"
        >
          <SearchIcon className="w-6 h-6" />
        </button>
      </form>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100] mt-1 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <Link 
              href={`/shop/products/${product.slug}`} 
              key={product.slug}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setOpen(false)}
            >
              <div className="relative w-10 h-10 shrink-0">
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover rounded-sm"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black dark:text-white">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.price} AED</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}