'use server';

import { Coordinates } from '../maps';
import { calculateShipping } from '../services/shipping.service';
import { ShippingCalculation } from '../config/shipping';

interface CalculateShippingCostParams {
  destination: Coordinates;
  cartTotal: number;
  emirate?: string;
}

export async function calculateShippingCost(
  params: CalculateShippingCostParams
): Promise<{ success: boolean; data?: ShippingCalculation; error?: string }> {
  try {
    if (!params.destination?.lat || !params.destination?.lng) {
      return {
        success: false,
        error: 'Invalid destination coordinates',
      };
    }

    if (params.cartTotal < 0) {
      return {
        success: false,
        error: 'Invalid cart total',
      };
    }

    const calculation = await calculateShipping(params);

    return {
      success: true,
      data: calculation,
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return {
      success: false,
      error: 'Failed to calculate shipping cost',
    };
  }
}

/**
 * Validate shipping address has required fields for shipping calculation
 */
export async function validateShippingAddress(address: any): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!address) {
    return { success: false, error: 'Address is required' };
  }

  if (!address.lat || !address.lng) {
    return { 
      success: false, 
      error: 'Address must have coordinates for shipping calculation' 
    };
  }

  if (!address.emirate && !address.region) {
    return {
      success: false,
      error: 'Address must include emirate/region information',
    };
  }

  return { success: true };
}
