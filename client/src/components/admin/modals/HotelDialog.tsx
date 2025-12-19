"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/types/api";
import { addressesApi, type Address } from "@/lib/services";

interface HotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  hotel?: Hotel | null;
}

export function HotelDialog({ open, onOpenChange, onSave, hotel }: HotelDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    rating: 0,
    rooms: 0,
    priceRange: "",
    description: "",
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
    if (hotel) {
      const addressId = (hotel as any).address_id?._id || (hotel as any).address_id || "";
      setFormData({
        name: hotel.name || "",
        image_url: (hotel as any).image_url || "",
        rating: hotel.rating || 0,
        rooms: hotel.rooms || 0,
        priceRange: hotel.priceRange || "",
        description: hotel.description || "",
        address_id: addressId,
        location: hotel.location || "",
      });
      // Set selected address if exists
      // Set selected address if exists
      if (addressId) {
        // Try to find in loaded addresses first (guaranteed to be fully populated)
        const foundAddr = addresses.find((a) => a._id === addressId);
        if (foundAddr) {
          setSelectedAddress(foundAddr);
          setAddressSearch(formatAddress(foundAddr));
        } else if (typeof (hotel as any).address_id === "object") {
          // Fallback to embedded object
          const addr = (hotel as any).address_id;
          setSelectedAddress(addr);
          setAddressSearch(formatAddress(addr));
        }
      }
    } else {
      setFormData({
        name: "",
        image_url: "",
        rating: 0,
        rooms: 0,
        priceRange: "",
        description: "",
        address_id: "",
        location: "",
      });
      setSelectedAddress(null);
      setAddressSearch("");
    }
  }, [hotel, open, addresses]);

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
    if (!formData.address_id) {
      alert("Vui lòng chọn địa chỉ!");
      return;
    }
    setLoading(true);
    try {
      console.log("Submitting hotel data:", formData);
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hotel ? "Sửa Khách sạn" : "Thêm Khách sạn mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên khách sạn <span className="text-red-500">*</span></label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên khách sạn"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Address Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa chỉ <span className="text-red-500">*</span></label>
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
                placeholder="Tìm kiếm địa chỉ..."
                className={selectedAddress ? "border-green-500" : ""}
              />
              {selectedAddress && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
              )}

              {/* Dropdown */}
              {showAddressDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingAddresses ? (
                    <div className="p-3 text-center text-gray-500">Đang tải...</div>
                  ) : filteredAddresses.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">Không tìm thấy địa chỉ</div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Đánh giá</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số phòng</label>
              <Input
                type="number"
                min="0"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Khoảng giá</label>
            <Input
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              placeholder="VD: 500.000 - 1.000.000 VND"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : hotel ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
