// Map provider interface for easy switching between providers

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchOptions {
  language: 'en' | 'ar';
  country?: string[];  // ['AE', 'SA']
  types?: string[];   // ['poi', 'address', 'place']
  proximity?: Coordinates;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  nameArabic?: string;
  fullAddress: string;
  addressArabic?: string;
  type: 'poi' | 'address' | 'place' | 'street' | 'locality' | 'region';
  category?: string;
  coordinates: Coordinates;
  distance?: number;
  context?: {
    place?: string;
    district?: string;
    postcode?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
}

export interface LocationDetails {
  id: string;
  name: string;
  nameArabic?: string;
  fullAddress: string;
  addressArabic?: string;
  coordinates: Coordinates;
  type: string;
  placeType?: string[];
  properties?: Record<string, any>;
  context?: {
    place?: string;
    district?: string;
    postcode?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
}

export interface Address {
  fullAddress: string;
  fullAddressArabic?: string;
  street?: string;
  city?: string;
  district?: string;
  region?: string;
  emirate?: string;
  country?: string;
  postcode?: string;
  coordinates: Coordinates;
}

export interface DistanceResult {
  distance: number;  // in kilometers
  duration?: number; // in minutes
}

export interface MapProvider {
  name: string;
  
  // Session management for cost optimization
  createSession(): string;
  
  // Search for locations
  search(
    query: string, 
    session: string, 
    options: SearchOptions
  ): Promise<SearchResult[]>;
  
  // Retrieve full location details (ends session billing)
  retrieve(
    id: string, 
    session: string
  ): Promise<LocationDetails>;
  
  // Reverse geocode coordinates to address
  reverseGeocode(
    lat: number, 
    lng: number, 
    language?: 'en' | 'ar'
  ): Promise<Address>;
  
  // Optional: Calculate distance between two points
  getDistance?(
    from: Coordinates, 
    to: Coordinates
  ): Promise<DistanceResult>;
}

export interface MapStyle {
  url: string;
  name: string;
  language?: 'en' | 'ar';
}

export interface MapConfig {
  defaultCenter: Coordinates;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  styles: {
    en: MapStyle;
    ar: MapStyle;
  };
  searchDefaults: {
    country: string[];
    types: string[];
    limit: number;
  };
}
