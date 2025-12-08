"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import dynamic from "next/dynamic";
import { ShippingAddressSchema } from "@/lib/validator";
import { z } from "zod";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import("./map"), { ssr: false });

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const COUNTRIES = ["UAE"]; // Extensible for later

type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export default function ShippingAddressForm({
  initialAddress,
  onSave,
}: {
  initialAddress?: ShippingAddress;
  onSave: (address: ShippingAddress) => void;
}) {
  const [address, setAddress] = useState<ShippingAddress>(
    initialAddress || {
      fullName: "",
      street: "",
      city: "",
      emirate: "",
      country: "UAE",
      lat: undefined,
      lng: undefined,
    }
  );

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ShippingAddress, value: any) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setAddress((prev) => ({ ...prev, lat, lng }));
  };

  const handleMapConfirm = () => {
      setIsMapOpen(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = ShippingAddressSchema.safeParse(address);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }
    onSave(result.data);
    toast.success("Address saved successfully");
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold">Shipping Address</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={address.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              value={address.country}
              onValueChange={(val) => handleChange("country", val)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Emirate</label>
            <Select
              value={address.emirate}
              onValueChange={(val) => handleChange("emirate", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Emirate" />
              </SelectTrigger>
              <SelectContent>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emirate && <p className="text-red-500 text-xs">{errors.emirate}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input
              value={address.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Dubai"
            />
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Street Address</label>
          <Input
            value={address.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="123 Main St, Apt 4B"
          />
          {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}
        </div>

        {/* <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setIsMapOpen(true)} className="w-full md:w-auto">
                    <MapPin className="w-4 h-4 mr-2" />
                    {address.lat && address.lng ? "Change Location on Map" : "Choose on Map"}
                </Button>
                {address.lat && address.lng && (
                    <span className="text-xs text-muted-foreground">
                        Selected: {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
                    </span>
                )}
            </div>
        </div> */}

        <Button type="submit" className="w-full cursor-pointer">Save Address</Button>
      </form>

      <Modal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        title="Select Location"
        className="max-w-3xl"
      >
        <div className="space-y-4">
            <Map
                location={address.lat && address.lng ? { lat: address.lat, lng: address.lng } : undefined}
                onLocationSelect={handleLocationSelect}
            />
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsMapOpen(false)}>Cancel</Button>
                <Button onClick={handleMapConfirm}>Confirm Location</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
