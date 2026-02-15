"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShippingAddressSchema } from "@/lib/validator";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Navigation } from "lucide-react";
import { LocationPickerModal } from "./location-picker";

type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export default function ShippingAddressForm({
  initialAddress,
  onSave,
  fullName = "",
}: {
  initialAddress?: ShippingAddress;
  onSave: (address: ShippingAddress) => void;
  fullName?: string;
}) {
  const [address, setAddress] = useState<ShippingAddress>(
    initialAddress || {
      fullName: fullName,
      street: "",
      city: "",
      emirate: "",
      country: "UAE",
      lat: undefined,
      lng: undefined,
    }
  );

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLocationConfirm = (location: any) => {
    // Update address with location data
    const newAddress: ShippingAddress = {
      fullName: fullName || address.fullName || '', 
      street: location.address || '',
      city: location.city || '',
      emirate: location.emirate || '',
      country: "UAE",
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
    };
    
    setAddress(newAddress);
    onSave(newAddress);
    toast.success("Address saved successfully");
  };

  return (
    <div className="space-y-4">
      {/* Selected Address Preview */}
      {address.lat && address.lng && address.street ? (
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="relative p-5 bg-card border border-primary/20 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg text-foreground mb-1.5">{address.fullName}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                  {address.street}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {address.city}, {address.emirate}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-primary/70 font-mono">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{address.lat.toFixed(4)}°N, {address.lng.toFixed(4)}°E</span>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsLocationModalOpen(true)}
                className="shrink-0 text-primary hover:text-primary/90 hover:bg-primary/10 font-medium"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Initial state - no address selected */
        <div className="text-center py-12 space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
              <MapPin className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2.5 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Select Your Location
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Choose your exact delivery location on the map for accurate shipping calculation  and faster delivery
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            size="lg"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Select Location on Map
          </Button>
        </div>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={
          address.lat && address.lng
            ? {
                address: address.street || '',
                coordinates: { lat: address.lat, lng: address.lng },
                city: address.city,
                emirate: address.emirate,
              }
            : undefined
        }
      />
    </div>
  );
}
