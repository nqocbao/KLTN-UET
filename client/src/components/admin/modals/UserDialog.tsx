"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/types/api";
import { addressesApi, type Address } from "@/lib/services";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  user?: User | null;
}

export function UserDialog({ open, onOpenChange, onSave, user }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Customer",
    address_id: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  // Address search states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressSearch, setAddressSearch] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressesApi.getAll({ limit: 100 });
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open, fetchAddresses]);

  useEffect(() => {
    if (user) {
      // Handle address_id similar to HotelDialog
      const addressId = (user as any).address_id?._id || (user as any).address_id || "";
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Don't show password on edit
        phone: user.phone || "",
        role: user.role || "Customer",
        address_id: addressId,
        location: "", // Will be set by address search
      });

      // Set selected address if exists
      if (addressId) {
        // Try to find in loaded addresses first
        const foundAddr = addresses.find((a) => a._id === addressId);
        if (foundAddr) {
          setSelectedAddress(foundAddr);
          setAddressSearch(formatAddress(foundAddr));
        } else if (typeof (user as any).address_id === "object") {
          // Fallback to embedded object
          const addr = (user as any).address_id;
          setSelectedAddress(addr);
          setAddressSearch(formatAddress(addr));
        }
      }
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "Customer",
        address_id: "",
        location: "",
      });
      setSelectedAddress(null);
      setAddressSearch("");
    }
  }, [user, open, addresses]);

  // Format address for display
  const formatAddress = (addr: Address): string => {
    const parts = [];
    if (addr.ward_id?.name) parts.push(addr.ward_id.name);
    if (addr.district_id?.name) parts.push(addr.district_id.name);
    if (addr.province_id?.name) parts.push(addr.province_id.name);
    return parts.join(", ") || `Address ${addr._id.slice(-6)}`;
  };

  // Filter addresses based on search
  const filteredAddresses = addresses.filter((addr) => {
    const searchLower = addressSearch.toLowerCase();
    const fullAddress = formatAddress(addr).toLowerCase();
    return fullAddress.includes(searchLower);
  });

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
    const locationStr = formatAddress(addr);
    setFormData({ ...formData, address_id: addr._id, location: locationStr });
    setAddressSearch(locationStr);
    setShowAddressDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove password if empty on edit
      const dataToSubmit = { ...formData };
      if (user && !dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }
      
      // Handle empty address_id (optional field)
      if (!dataToSubmit.address_id) {
        delete (dataToSubmit as any).address_id;
      }
      
      console.log("Submitting user data:", dataToSubmit);
      await onSave(dataToSubmit);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Password {user && <span className="text-gray-500 font-normal">(Leave blank to keep current)</span>}
              {!user && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+84 123 456 789"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Guide">Guide</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Address <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Input
                value={addressSearch}
                onChange={(e) => {
                  setAddressSearch(e.target.value);
                  setShowAddressDropdown(true);
                  if (!e.target.value) {
                    setSelectedAddress(null);
                    setFormData({ ...formData, address_id: "" });
                  }
                }}
                onFocus={() => setShowAddressDropdown(true)}
                placeholder="Search address..."
                className={selectedAddress ? "border-green-500" : ""}
              />
              {selectedAddress && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
              )}

              {/* Dropdown */}
              {showAddressDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingAddresses ? (
                    <div className="p-3 text-center text-gray-500">Loading...</div>
                  ) : filteredAddresses.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">No address found</div>
                  ) : (
                    filteredAddresses.map((addr) => (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                          selectedAddress?._id === addr._id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          📍 {formatAddress(addr)}
                        </div>
                        {addr.address_detail && (
                          <div className="text-sm text-gray-500">{addr.address_detail}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Click outside to close */}
            {showAddressDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAddressDropdown(false)}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : user ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
