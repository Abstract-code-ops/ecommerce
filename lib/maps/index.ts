import { MapProvider } from './types';
import { MapboxProvider } from './providers/mapbox';

// Provider registry for easy switching
const providers = {
  mapbox: MapboxProvider,
  // Future providers can be added here:
  // google: GoogleProvider,
  // maplibre: MapLibreProvider,
};

// Active provider - change this to switch providers
const ACTIVE_PROVIDER: keyof typeof providers = 'mapbox';

// Export the active provider instance
export const mapProvider: MapProvider = new providers[ACTIVE_PROVIDER]();

// Export types for use in components
export type { 
  MapProvider, 
  SearchOptions, 
  SearchResult, 
  LocationDetails, 
  Address, 
  Coordinates,
  DistanceResult,
  MapConfig,
  MapStyle
} from './types';

// Export config
export { MAP_CONFIG, MAPBOX_CONFIG } from './config';
