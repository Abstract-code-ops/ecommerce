import { 
  MapProvider, 
  SearchOptions, 
  SearchResult, 
  LocationDetails, 
  Address, 
  Coordinates,
  DistanceResult 
} from '../types';
import { MAPBOX_CONFIG, MAP_CONFIG } from '../config';

export class MapboxProvider implements MapProvider {
  name = 'mapbox';
  private accessToken: string;

  constructor() {
    this.accessToken = MAPBOX_CONFIG.accessToken;
  }

  createSession(): string {
    // Generate a UUID for session token
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async search(
    query: string,
    session: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    const { language = 'en', country, types, proximity, limit = 5 } = options;

    // Build search parameters
    const params = new URLSearchParams({
      q: query,
      access_token: this.accessToken,
      session_token: session,
      language: language,
      limit: limit.toString(),
    });

    // Add optional parameters
    if (country && country.length > 0) {
      params.append('country', country.join(','));
    }

    if (types && types.length > 0) {
      params.append('types', types.join(','));
    }

    if (proximity) {
      params.append('proximity', `${proximity.lng},${proximity.lat}`);
    }

    try {
      const response = await fetch(
        `${MAPBOX_CONFIG.searchBoxApiUrl}/suggest?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();

      return (data.suggestions || []).map((item: any) => this.mapSearchResult(item));
    } catch (error) {
      console.error('Mapbox search error:', error);
      return [];
    }
  }

  async retrieve(
    id: string,
    session: string
  ): Promise<LocationDetails> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      session_token: session,
    });

    try {
      const response = await fetch(
        `${MAPBOX_CONFIG.searchBoxApiUrl}/retrieve/${id}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature) {
        throw new Error('No feature found');
      }

      return this.mapLocationDetails(feature);
    } catch (error) {
      console.error('Mapbox retrieve error:', error);
      throw error;
    }
  }

  async reverseGeocode(
    lat: number,
    lng: number,
    language: 'en' | 'ar' = 'en'
  ): Promise<Address> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      language: language,
    });

    try {
      const response = await fetch(
        `${MAPBOX_CONFIG.geocodingApiUrl}/reverse?longitude=${lng}&latitude=${lat}&${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature) {
        throw new Error('No address found');
      }

      return this.mapAddress(feature, { lat, lng });
    } catch (error) {
      console.error('Mapbox reverse geocode error:', error);
      throw error;
    }
  }

  // Optional distance calculation (using straight-line distance)
  async getDistance(
    from: Coordinates,
    to: Coordinates
  ): Promise<DistanceResult> {
    // Use Haversine formula for straight-line distance
    const distance = this.haversineDistance(from, to);
    
    // Approximate duration (assuming 60 km/h average speed)
    const duration = (distance / 60) * 60; // in minutes

    return { distance, duration };
  }

  // Helper methods
  private mapSearchResult(item: any): SearchResult {
    const coordinates = item.geometry?.coordinates || [0, 0];
    
    // Extract context information
    const context = item.context || {};
    
    // Determine type based on place_type
    const placeType = item.feature_type || 'place';
    let type: SearchResult['type'] = 'place';
    
    if (placeType === 'poi') type = 'poi';
    else if (placeType === 'address') type = 'address';
    else if (placeType === 'street') type = 'street';
    else if (placeType === 'locality') type = 'locality';
    else if (placeType === 'region') type = 'region';

    return {
      id: item.mapbox_id || '',
      name: item.name || '',
      nameArabic: item.name_preferred,
      fullAddress: item.full_address || item.place_formatted || '',
      type,
      category: item.poi_category?.join(', '),
      coordinates: {
        lat: coordinates[1],
        lng: coordinates[0],
      },
      distance: item.distance,
      context: {
        place: context.place?.name,
        district: context.district?.name,
        postcode: context.postcode?.name,
        locality: context.locality?.name,
        region: context.region?.name,
        country: context.country?.name,
      },
    };
  }

  private mapLocationDetails(feature: any): LocationDetails {
    const coordinates = feature.geometry?.coordinates || [0, 0];
    const properties = feature.properties || {};
    const context = properties.context || {};

    return {
      id: feature.id || '',
      name: properties.name || '',
      nameArabic: properties.name_preferred,
      fullAddress: properties.full_address || properties.place_formatted || '',
      coordinates: {
        lat: coordinates[1],
        lng: coordinates[0],
      },
      type: feature.type || 'Feature',
      placeType: properties.place_type || [],
      properties,
      context: {
        place: context.place?.name,
        district: context.district?.name,
        postcode: context.postcode?.name,
        locality: context.locality?.name,
        region: context.region?.name,
        country: context.country?.name,
      },
    };
  }

  private mapAddress(feature: any, coordinates: Coordinates): Address {
    const properties = feature.properties || {};
    const context = properties.context || {};

    return {
      fullAddress: properties.full_address || properties.place_formatted || '',
      fullAddressArabic: properties.full_address_ar,
      street: context.street?.name,
      city: context.place?.name,
      district: context.district?.name,
      region: context.region?.name,
      emirate: context.region?.name,
      country: context.country?.name,
      postcode: context.postcode?.name,
      coordinates,
    };
  }

  private haversineDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.lat - from.lat);
    const dLng = this.toRadians(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.lat)) *
        Math.cos(this.toRadians(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
