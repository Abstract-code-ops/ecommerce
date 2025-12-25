"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Dynamically import heavy Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface MapProps {
  location?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

// Move LocationMarker to a separate component for cleaner code
function LocationMarkerInner({ onLocationSelect, location }: MapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  
  useEffect(() => {
    // Dynamically import Leaflet
    import('leaflet').then((leaflet) => {
      // Fix for default marker icon
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setL(leaflet);
      if (location) {
        setPosition(new leaflet.LatLng(location.lat, location.lng));
      }
    });
  }, []);

  useEffect(() => {
    if (L && location) {
      setPosition(new L.LatLng(location.lat, location.lng));
    }
  }, [location, L]);

  if (!L || !position) return null;
  
  return <Marker position={position} />;
}

export default function Map({ location, onLocationSelect }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default to Dubai, UAE
  const defaultCenter: [number, number] = location ? [location.lat, location.lng] : [25.2048, 55.2708];

  if (!isMounted) {
    return (
      <div 
        className="h-[400px] w-full rounded-md bg-gray-200 animate-pulse flex items-center justify-center"
        style={{ height: "400px", width: "100%" }}
      >
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[400px] w-full rounded-md z-0"
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarkerInner onLocationSelect={onLocationSelect} location={location} />
    </MapContainer>
  );
}
