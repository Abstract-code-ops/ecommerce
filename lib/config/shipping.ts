import { Coordinates } from '../maps';

// Shipping configuration
export const SHIPPING_CONFIG = {
  // Store location (will be overridden by admin settings)
  storeLocation: {
    lat: parseFloat(process.env.STORE_LATITUDE || '25.3463'),
    lng: parseFloat(process.env.STORE_LONGITUDE || '55.4209'),
    address: process.env.STORE_ADDRESS || 'Sharjah, UAE',
    emirate: 'Sharjah',
  },

  // Free shipping threshold (in AED)
  freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '200'),

  // Distance-based rates
  shortDistanceKm: parseFloat(process.env.SHORT_DISTANCE_KM || '50'),
  shortDistanceRate: parseFloat(process.env.SHORT_DISTANCE_RATE || '25'),
  longDistanceRatePerKm: parseFloat(process.env.LONG_DISTANCE_RATE_PER_KM || '0.75'),

  // Free shipping emirates (always lowercase for comparison)
  freeShippingEmirates: (process.env.FREE_SHIPPING_EMIRATES || 'sharjah,ajman')
    .toLowerCase()
    .split(',')
    .map(e => e.trim()),
};

// Helper to check if emirate qualifies for free shipping
export function isFreeshippingEmirate(emirate?: string): boolean {
  if (!emirate) return false;
  const normalizedEmirate = emirate.toLowerCase().trim();
  return SHIPPING_CONFIG.freeShippingEmirates.some(e => 
    normalizedEmirate.includes(e)
  );
}

// Helper to get store location (can be overridden by admin settings in the future)
export async function getStoreLocation(): Promise<Coordinates & { address: string; emirate: string }> {
  // TODO: Fetch from admin settings in database
  // For now, return the config value
  return SHIPPING_CONFIG.storeLocation;
}

// Shipping calculation result
export interface ShippingCalculation {
  cost: number;
  isFree: boolean;
  reason: string;
  distance?: number;
  breakdown?: {
    baseRate?: number;
    distanceRate?: number;
    distanceKm?: number;
  };
}
