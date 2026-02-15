import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Coordinates, mapProvider } from '@/lib/maps';
import { useMapSession } from '@/lib/hooks/useMapSession';
import { SearchInput } from './search-input';
import { LocationPreview } from './location-preview';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(
  () => import('./map-view').then(mod => ({ default: mod.MapView })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

interface LocationData {
  address: string;
  addressArabic?: string;
  coordinates: Coordinates;
  emirate?: string;
  city?: string;
  placeId?: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: LocationData) => void;
  initialLocation?: LocationData;
  defaultCenter?: Coordinates;
  cartTotal?: number; // For shipping calculation preview
  title?: string;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
  defaultCenter = { lat: 25.2048, lng: 55.2708 }, // Dubai
  cartTotal = 0,
  title,
}: LocationPickerModalProps) {
  const language = 'en'; // Force English
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [markerPosition, setMarkerPosition] = useState<Coordinates | undefined>(
    initialLocation?.coordinates || defaultCenter
  );
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  
  const { sessionToken, createSession, endSession, getSessionToken } = useMapSession();

  // Create session when modal opens
  useEffect(() => {
    if (isOpen) {
      createSession();
    } else {
      endSession();
    }
  }, [isOpen, createSession, endSession]);

  // Handle search result selection
  const handleSelectSearchResult = (result: any) => {
    const location: LocationData = {
      address: result.fullAddress,
      addressArabic: result.addressArabic,
      coordinates: result.coordinates,
      emirate: result.context?.region,
      city: result.context?.place,
      placeId: result.id,
    };

    setSelectedLocation(location);
    setMarkerPosition(result.coordinates);
  };

  // Handle map location change (click or drag)
  const handleLocationChange = async (coordinates: Coordinates) => {
    setMarkerPosition(coordinates);
    setIsReverseGeocoding(true);

    try {
      // Reverse geocode to get address
      const address = await mapProvider.reverseGeocode(
        coordinates.lat,
        coordinates.lng,
        language
      );

      const location: LocationData = {
        address: address.fullAddress || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        addressArabic: address.fullAddressArabic,
        coordinates,
        emirate: address.emirate || address.region,
        city: address.city,
      };

      setSelectedLocation(location);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Still set coordinates even if reverse geocoding fails
      setSelectedLocation({
        address: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        coordinates,
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Calculate estimated shipping
  const estimateShipping = () => {
    if (!selectedLocation?.emirate) return undefined;

    const emirate = selectedLocation.emirate.toLowerCase();
    
    // Free shipping for orders >= 200 AED
    if (cartTotal >= 200) {
      return {
        cost: 0,
        isFree: true,
        reason: 'Free shipping for orders above 200 AED',
      };
    }

    // Free for Sharjah and Ajman
    if (emirate.includes('sharjah') || emirate.includes('ajman')) {
      return {
        cost: 0,
        isFree: true,
        reason: 'Free local delivery',
      };
    }

    // For other emirates, show estimated range
    return {
      cost: 25,
      isFree: false,
      reason: 'Final price calculated based on distance',
    };
  };

  // Check if location is exact enough
  const isExactLocation = () => {
    if (!selectedLocation) return false;
    
    // Must have coordinates object
    if (!selectedLocation.coordinates) return false;
    
    // Must have coordinates
    if (!selectedLocation.coordinates.lat || !selectedLocation.coordinates.lng) {
      return false;
    }

    // Must have some address detail
    if (!selectedLocation.address || selectedLocation.address.length < 10) {
      return false;
    }

    return true;
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    if (!isExactLocation()) {
      toast.error('Please select an exact location by dragging the pin or searching');
      return;
    }

    onConfirm(selectedLocation);
    onClose();
  };

  const modalTitle = title || 'Select Location';

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            sessionToken={getSessionToken()}
            onSelectResult={handleSelectSearchResult}
            proximity={markerPosition}
          />
        </div>

        {/* Map */}
        <div className="mb-4 h-[400px] rounded-lg overflow-hidden border">
          <MapView
            center={markerPosition || defaultCenter}
            onLocationChange={handleLocationChange}
            markerPosition={markerPosition}
          />
        </div>

        {/* Location Preview */}
        {selectedLocation && (
          <div className="mb-6">
            <LocationPreview
              address={selectedLocation.address}
              addressArabic={selectedLocation.addressArabic}
              coordinates={selectedLocation.coordinates}
              emirate={selectedLocation.emirate}
              isExactLocation={isExactLocation()}
              estimatedShipping={estimateShipping()}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm}
            disabled={!isExactLocation() || isReverseGeocoding}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
}
