'use client';

import { MapPin, Navigation2 } from 'lucide-react';
import { Coordinates } from '@/lib/maps';

interface LocationPreviewProps {
  address: string;
  addressArabic?: string;
  coordinates: Coordinates;
  emirate?: string;
  isExactLocation: boolean;
  estimatedShipping?: {
    cost: number;
    isFree: boolean;
    reason?: string;
  };
}

export function LocationPreview({
  address,
  addressArabic,
  coordinates,
  emirate,
  isExactLocation,
  estimatedShipping,
}: LocationPreviewProps) {
  const displayAddress = address;

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {displayAddress || 'No location selected'}
          </p>
          {coordinates.lat && coordinates.lng && (
            <p className="text-xs text-gray-500 mt-1">
              {coordinates.lat.toFixed(6)}°N, {coordinates.lng.toFixed(6)}°E
            </p>
          )}
          {emirate && (
            <p className="text-xs text-gray-600 mt-1">
              Emirate: <span className="font-medium">{emirate}</span>
            </p>
          )}
        </div>
      </div>

      {!isExactLocation && (
        <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <Navigation2 className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Please select an exact location by dragging the pin or searching for a nearby landmark
          </p>
        </div>
      )}

      {estimatedShipping && isExactLocation && (
        <div className={`p-2 rounded ${estimatedShipping.isFree ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className="text-xs font-medium">
            🚚 Shipping: 
            {estimatedShipping.isFree ? (
              <span className="text-green-700">FREE</span>
            ) : (
              <span className="text-blue-700">{estimatedShipping.cost.toFixed(2)} AED</span>
            )}
          </p>
          {estimatedShipping.reason && (
            <p className="text-xs text-gray-600 mt-1">{estimatedShipping.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
