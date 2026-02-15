import { Coordinates } from '../maps';
import { 
  SHIPPING_CONFIG, 
  ShippingCalculation, 
  isFreeshippingEmirate,
  getStoreLocation 
} from '../config/shipping';
import { calculateApproximateRoadDistance } from './distance.service';

interface CalculateShippingParams {
  destination: Coordinates;
  cartTotal: number;
  emirate?: string;
}

/**
 * Calculate shipping cost based on destination and cart total
 */
export async function calculateShipping(
  params: CalculateShippingParams
): Promise<ShippingCalculation> {
  const { destination, cartTotal, emirate } = params;

  // Rule 1: Free shipping for orders >= threshold
  if (cartTotal >= SHIPPING_CONFIG.freeShippingThreshold) {
    return {
      cost: 0,
      isFree: true,
      reason: `Free shipping for orders above ${SHIPPING_CONFIG.freeShippingThreshold} AED`,
    };
  }

  // Rule 2: Free shipping for specific emirates (Sharjah, Ajman)
  if (emirate && isFreeshippingEmirate(emirate)) {
    return {
      cost: 0,
      isFree: true,
      reason: `Free shipping in ${emirate}`,
    };
  }

  // Rule 3: Distance-based calculation
  const storeLocation = await getStoreLocation();
  const distance = calculateApproximateRoadDistance(storeLocation, destination);

  // Rule 3a: Short distance (≤ 50km) - flat rate
  if (distance <= SHIPPING_CONFIG.shortDistanceKm) {
    return {
      cost: SHIPPING_CONFIG.shortDistanceRate,
      isFree: false,
      reason: `Flat rate for distances up to ${SHIPPING_CONFIG.shortDistanceKm}km`,
      distance,
      breakdown: {
        baseRate: SHIPPING_CONFIG.shortDistanceRate,
      },
    };
  }

  // Rule 3b: Long distance (> 50km) - per km rate
  const cost = distance * SHIPPING_CONFIG.longDistanceRatePerKm;
  
  return {
    cost: parseFloat(cost.toFixed(2)),
    isFree: false,
    reason: `${SHIPPING_CONFIG.longDistanceRatePerKm} AED per km`,
    distance,
    breakdown: {
      distanceRate: SHIPPING_CONFIG.longDistanceRatePerKm,
      distanceKm: distance,
    },
  };
}

/**
 * Format shipping calculation for display
 */
export function formatShippingDisplay(
  calculation: ShippingCalculation,
  language: 'en' | 'ar' = 'en'
): string {
  if (calculation.isFree) {
    return language === 'ar' ? 'شحن مجاني' : 'FREE';
  }

  const formattedCost = `${calculation.cost.toFixed(2)} AED`;
  
  if (calculation.breakdown?.distanceKm) {
    const distance = calculation.breakdown.distanceKm.toFixed(1);
    return language === 'ar'
      ? `${formattedCost} (${distance} كم)`
      : `${formattedCost} (${distance}km)`;
  }

  return formattedCost;
}

/**
 * Get shipping breakdown text
 */
export function getShippingBreakdown(
  calculation: ShippingCalculation,
  language: 'en' | 'ar' = 'en'
): string {
  if (calculation.isFree) {
    return calculation.reason;
  }

  if (calculation.breakdown?.distanceKm && calculation.breakdown?.distanceRate) {
    const { distanceKm, distanceRate } = calculation.breakdown;
    const cost = calculation.cost.toFixed(2);
    const distance = distanceKm.toFixed(1);
    
    return language === 'ar'
      ? `${cost} درهم (${distance} كم × ${distanceRate} درهم/كم)`
      : `${cost} AED (${distance}km × ${distanceRate} AED/km)`;
  }

  if (calculation.breakdown?.baseRate) {
    return language === 'ar'
      ? `سعر ثابت: ${calculation.breakdown.baseRate} درهم`
      : `Flat rate: ${calculation.breakdown.baseRate} AED`;
  }

  return `${calculation.cost.toFixed(2)} AED`;
}
