'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mapProvider, SearchResult, Coordinates } from '@/lib/maps';
import { toast } from 'sonner';

interface SearchInputProps {
  sessionToken: string;
  onSelectResult: (result: SearchResult) => void;
  proximity?: Coordinates;
  placeholder?: string;
}

export function SearchInput({
  sessionToken,
  onSelectResult,
  proximity,
  placeholder,
}: SearchInputProps) {
  const language = 'en'; // Force English
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder = 'Search for your location...';

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = await mapProvider.search(searchQuery, sessionToken, {
        language,
        country: ['AE', 'SA'],
        types: ['poi', 'address', 'place', 'street'],
        proximity,
        limit: 5,
      });

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search error');
    } finally {
      setIsSearching(false);
    }
  }, [sessionToken, proximity]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  const handleSelectResult = async (result: SearchResult) => {
    try {
      // Retrieve full details (this ends the session billing)
      const details = await mapProvider.retrieve(result.id, sessionToken);
      
      const fullResult: SearchResult = {
        ...result,
        fullAddress: details.fullAddress,
        addressArabic: details.addressArabic,
        coordinates: details.coordinates,
        context: details.context,
      };

      onSelectResult(fullResult);
      setQuery(result.fullAddress);
      setShowResults(false);
      setResults([]);
    } catch (error) {
      console.error('Error retrieving location:', error);
      toast.error('Error loading location');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (type: string, category?: string) => {
    if (type === 'poi') {
      if (category?.includes('shopping')) return '🛒';
      if (category?.includes('restaurant')) return '🍽️';
      if (category?.includes('hotel')) return '🏨';
      if (category?.includes('hospital')) return '🏥';
      if (category?.includes('school')) return '🎓';
      return '📍';
    }
    if (type === 'address') return '🏠';
    if (type === 'street') return '🛣️';
    return '📍';
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder || defaultPlaceholder}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div ref={resultsRef} className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getCategoryIcon(result.type, result.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {result.fullAddress}
                  </p>
                  {result.distance && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(result.distance / 1000).toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showResults && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No results found
          </p>
        </div>
      )}
    </div>
  );
}
