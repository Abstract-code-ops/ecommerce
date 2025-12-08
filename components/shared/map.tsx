"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix for default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  location?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect, location }: MapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    location ? new L.LatLng(location.lat, location.lng) : null
  );

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (location) {
        const newPos = new L.LatLng(location.lat, location.lng);
        setPosition(newPos);
        map.flyTo(newPos, map.getZoom());
    }
  }, [location, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Map({ location, onLocationSelect }: MapProps) {
  // Default to Dubai, UAE
  const defaultCenter: L.LatLngExpression = location ? [location.lat, location.lng] : [25.2048, 55.2708];

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
      <LocationMarker onLocationSelect={onLocationSelect} location={location} />
    </MapContainer>
  );
}
