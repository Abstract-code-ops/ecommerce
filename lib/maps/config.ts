import { MapConfig } from './types';

// UAE center (approximate center between emirates)
const UAE_CENTER = { lat: 25.2048, lng: 55.2708 }; // Dubai

export const MAP_CONFIG: MapConfig = {
  defaultCenter: UAE_CENTER,
  defaultZoom: 10,
  minZoom: 8,
  maxZoom: 18,
  
  styles: {
    en: {
      url: 'mapbox://styles/mapbox/streets-v12?language=en',
      name: 'Streets',
      language: 'en',
    },
    ar: {
      url: 'mapbox://styles/mapbox/streets-v12?language=en',
      name: 'Streets',
      language: 'en',
    },
  },
  
  searchDefaults: {
    country: ['AE', 'SA'],
    types: ['poi', 'address', 'place', 'street'],
    limit: 5,
  },
};

export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  searchBoxApiUrl: 'https://api.mapbox.com/search/searchbox/v1',
  geocodingApiUrl: 'https://api.mapbox.com/search/geocode/v6',
};

// Validate token exists
if (typeof window !== 'undefined' && !MAPBOX_CONFIG.accessToken) {
  console.warn('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set. Map features will not work.');
}
