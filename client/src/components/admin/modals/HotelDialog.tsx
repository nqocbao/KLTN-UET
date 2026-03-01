"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/types/api";
import { addressesApi } from "@/lib/services";
import { LocationSelector } from "@/components/admin/common/LocationSelector";
import { LocationAutocomplete, type LocationSuggestion } from "@/components/ui/location-autocomplete";

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
    availableRooms: 0,
    priceRange: "",
    priceTwoSingleBed: 0,
    priceOneSingleOneDoubleBed: 0,
    description: "",
    address_id: "",
    location: "", // Địa chỉ cụ thể (số nhà, tên đường)
  });
  const [loading, setLoading] = useState(false);
  const [quickSearchValue, setQuickSearchValue] = useState("");

  // Address IDs state for Selector
  const [locationIds, setLocationIds] = useState({
    country_id: "",
    province_id: "",
    district_id: "",
    ward_id: "",
  });

  // Handle quick location selection from Autocomplete
  const handleQuickLocationSelect = (suggestion: LocationSuggestion) => {
    console.log("HotelDialog Selected:", suggestion);
    setQuickSearchValue(suggestion.fullName || suggestion.name);

    // Reset all first
    const newIds = {
      country_id: "",
      province_id: "",
      district_id: "",
      ward_id: "",
    };

    if (suggestion.type === "ward") {
      newIds.ward_id = suggestion.id;
      newIds.district_id = suggestion.district_id || "";
      newIds.province_id = suggestion.province_id || "";
      newIds.country_id = suggestion.country_id || "";
    } else if (suggestion.type === "district") {
      newIds.district_id = suggestion.id;
      newIds.province_id = suggestion.province_id || "";
      newIds.country_id = suggestion.country_id || "";
    } else if (suggestion.type === "province") {
      newIds.province_id = suggestion.id;
      newIds.country_id = suggestion.country_id || "";
    } else if (suggestion.type === "country") {
      newIds.country_id = suggestion.id;
    }

    console.log("Setting new IDs:", newIds);
    setLocationIds(newIds);
  };

  useEffect(() => {
    if (hotel) {
      const addressId = (hotel as any).address_id?._id || (hotel as any).address_id || "";
      
      // Determine location from address object or fallback to hotel.location
      let fetchedLocation = hotel.location || "";
      if (typeof (hotel as any).address_id === "object" && (hotel as any).address_id?.address_detail) {
          fetchedLocation = (hotel as any).address_id.address_detail;
      }

      setFormData({
        name: hotel.name || "",
        image_url: (hotel as any).image_url || "",
        rating: hotel.rating || 0,
        rooms: hotel.rooms || 0,
        availableRooms: hotel.availableRooms || 0,
        priceRange: hotel.priceRange || "",
        priceTwoSingleBed: hotel.priceTwoSingleBed || 0,
        priceOneSingleOneDoubleBed: hotel.priceOneSingleOneDoubleBed || 0,
        description: hotel.description || "",
        address_id: addressId,
        location: fetchedLocation,
      });

      // Populate location selector if address data is available and populated
      if (typeof (hotel as any).address_id === "object" && (hotel as any).address_id) {
        const addr = (hotel as any).address_id;
        setLocationIds({
          country_id: addr.country_id?._id || addr.country_id || "",
          province_id: addr.province_id?._id || addr.province_id || "",
          district_id: addr.district_id?._id || addr.district_id || "",
          ward_id: addr.ward_id?._id || addr.ward_id || "",
        });
        setQuickSearchValue(""); // Reset quick search on modal open
      } else {
         setLocationIds({
          country_id: "",
          province_id: "",
          district_id: "",
          ward_id: "",
        });
         setQuickSearchValue("");
      }
    } else {
      setFormData({
        name: "",
        image_url: "",
        rating: 0,
        rooms: 0,
        availableRooms: 0,
        priceRange: "",
        priceTwoSingleBed: 0,
        priceOneSingleOneDoubleBed: 0,
        description: "",
        address_id: "",
        location: "",
      });
      setLocationIds({
        country_id: "",
        province_id: "",
        district_id: "",
        ward_id: "",
      });
      setQuickSearchValue("");
    }
  }, [hotel?._id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Prepare Address Data
      const addressPayload: any = {
        address_detail: formData.location,
      };

      if (locationIds.country_id) addressPayload.country_id = locationIds.country_id;
      if (locationIds.province_id) addressPayload.province_id = locationIds.province_id;
      if (locationIds.district_id) addressPayload.district_id = locationIds.district_id;
      if (locationIds.ward_id) addressPayload.ward_id = locationIds.ward_id;

      let finalAddressId = formData.address_id;

      // 2. Create or Update Address
      // Always create a new address to ensure uniqueness and prevent side effects
      // This decouples the hotel from any shared address reference
      const res = await addressesApi.create(addressPayload);
      if (res.success) {
        finalAddressId = res.data._id;
      } else {
        throw new Error("Failed to create address");
      }

      // 3. Save Hotel with Address ID and Specific Location
      const hotelPayload = {
        ...formData,
        address_id: finalAddressId,
      };

      await onSave(hotelPayload);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving hotel:", error);
      alert("Đã có lỗi xảy ra khi lưu khách sạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hotel ? "Sửa Khách sạn" : "Thêm Khách sạn mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               {/* Basic Info */}
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

               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Đánh giá</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating === 0 ? "" : formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                  />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Khoảng giá hiển thị</label>
                  <Input
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    placeholder="VD: 5 lits - 1 củ"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Location Selector */}
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 space-y-4">
                 <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Địa chỉ quản lý</h3>
                 
                 {/* Quick Search */}
                 <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Tìm kiếm nhanh (Tự động điền)</label>
                    <LocationAutocomplete 
                      value={quickSearchValue} 
                      onChange={setQuickSearchValue} 
                      onSelectLocation={handleQuickLocationSelect}
                      placeholder="Nhập Phường/Xã, Quận/Huyện..."
                      className="w-full"
                    />
                 </div>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">Hoặc chọn thủ công</span>
                    </div>
                  </div>

                 <LocationSelector 
                    initialValues={locationIds}
                    onChange={(values) => {
                        console.log("HotelDialog LocationSelector onChange TRIGGERED:", values);
                        setLocationIds(prev => ({ ...prev, ...values }));
                    }}
                 />
              </div>

              {/* Specific Location Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-red-500">*</span></label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="VD: 57 Hàng Bài, Hoàn Kiếm"
                  required
                />
                <p className="text-xs text-gray-500">Địa chỉ này sẽ được hiển thị trực tiếp cho người dùng.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Số phòng tổng</label>
              <Input
                type="number"
                min="0"
                value={formData.rooms === 0 ? "" : formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value === "" ? 0 : parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phòng trống</label>
              <Input
                type="number"
                min="0"
                value={formData.availableRooms === 0 ? "" : formData.availableRooms}
                onChange={(e) => setFormData({ ...formData, availableRooms: e.target.value === "" ? 0 : parseInt(e.target.value) })}
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium">Giá 2 giường đơn</label>
              <Input
                type="number"
                min="0"
                value={formData.priceTwoSingleBed === 0 ? "" : formData.priceTwoSingleBed}
                onChange={(e) => setFormData({ ...formData, priceTwoSingleBed: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
              />
            </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Giá 1 đơn, 1 đôi</label>
              <Input
                type="number"
                min="0"
                value={formData.priceOneSingleOneDoubleBed === 0 ? "" : formData.priceOneSingleOneDoubleBed}
                onChange={(e) => setFormData({ ...formData, priceOneSingleOneDoubleBed: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
              />
            </div>
          </div>
          
           <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về khách sạn..."
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
