'use client';

import { useEffect, useRef, useState } from 'react';
import { Coordinates } from '@/lib/maps';
import { MAPBOX_CONFIG, MAP_CONFIG } from '@/lib/maps';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  center: Coordinates;
  zoom?: number;
  onLocationChange: (coordinates: Coordinates) => void;
  markerPosition?: Coordinates;
}

export function MapView({
  center,
  zoom = MAP_CONFIG.defaultZoom,
  onLocationChange,
  markerPosition,
}: MapViewProps) {
  const language = 'en'; // Force English
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  
  // Use ref for callback to avoid dependency issues
  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  // Load Mapbox GL dynamically (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import('mapbox-gl');
        setMapboxgl(mapboxModule.default);
      } catch (error) {
        console.error('Error loading Mapbox:', error);
        setIsLoading(false);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxgl) return;
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    if (!MAPBOX_CONFIG.accessToken) {
      console.error('Mapbox access token is not configured');
      setIsLoading(false);
      return;
    }

    mapInitializedRef.current = true;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) {
        console.error('Map container not found');
        setIsLoading(false);
        return;
      }

      try {
        mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

        // Create map
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: MAP_CONFIG.styles[language].url,
          center: [center.lng, center.lat],
          zoom: zoom,
          attributionControl: false,
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // When map loads
        map.on('load', () => {
          setIsLoading(false);
          
          // Force English labels
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer: any) => {
              if (layer.layout && layer.layout['text-field']) {
                map.setLayoutProperty(
                  layer.id,
                  'text-field',
                  ['coalesce', ['get', 'name_en'], ['get', 'name']]
                );
              }
            });
          }

          // Create initial marker
          const initialPosition = markerPosition || center;
          const marker = new mapboxgl.Marker({
            color: '#3b82f6',
            draggable: true,
          })
            .setLngLat([initialPosition.lng, initialPosition.lat])
            .addTo(map);

          // Handle marker drag
          marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            onLocationChangeRef.current({
              lat: lngLat.lat,
              lng: lngLat.lng,
            });
          });

          markerRef.current = marker;
        });

        // Handle map clicks - move marker to clicked location
        map.on('click', (e: any) => {
          const coordinates: Coordinates = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          };
          
          // Move marker immediately
          if (markerRef.current) {
            markerRef.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          }
          
          // Notify parent component
          onLocationChangeRef.current(coordinates);
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapInitializedRef.current = false;
    };
  }, [mapboxgl]); // Only depend on mapboxgl, initialize map once

  // Update marker when markerPosition changes externally (from search)
  useEffect(() => {
    if (!markerRef.current || !markerPosition) return;
    
    // Just update marker position, no animations
    markerRef.current.setLngLat([markerPosition.lng, markerPosition.lat]);
    
    // Pan map to show marker
    if (mapRef.current) {
      mapRef.current.panTo([markerPosition.lng, markerPosition.lat], {
        duration: 500,
      });
    }
  }, [markerPosition]);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationChangeRef.current(coordinates);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check location permissions.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Use GPS button */}
      <Button
        type="button"
        size="sm"
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className="absolute bottom-4 left-4 shadow-lg"
      >
        {isGettingLocation ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Navigation className="w-4 h-4 mr-2" />
        )}
        My Location
      </Button>

      {/* Hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-xs text-gray-600">
        Click on map or drag pin to select location
      </div>
    </div>
  );
}
