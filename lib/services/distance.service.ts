import { Coordinates } from '../maps';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate road distance approximation
 * Multiplies straight-line distance by 1.3 to approximate road distance
 */
export function calculateApproximateRoadDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const straightLineDistance = calculateHaversineDistance(from, to);
  // Road distance is typically 20-40% longer than straight-line
  return straightLineDistance * 1.3;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
}
