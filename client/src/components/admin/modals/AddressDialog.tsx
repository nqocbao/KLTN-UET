"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressesApi, type Address } from "@/lib/services";
import { LocationSelector } from "@/components/admin/common/LocationSelector";
import { LocationAutocomplete, type LocationSuggestion } from "@/components/ui/location-autocomplete";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  address?: Address | null;
}

interface LocationIds {
  country_id: string;
  province_id: string;
  district_id: string;
  ward_id: string;
}

export function AddressDialog({ open, onOpenChange, onSave, address }: AddressDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
  });
  const [locationIds, setLocationIds] = useState<LocationIds>({
    country_id: "",
    province_id: "",
    district_id: "",
    ward_id: "",
  });
  
  const [quickSearchValue, setQuickSearchValue] = useState("");

  useEffect(() => {
    if (address) {
      setFormData({
        location: address.address_detail || "",
      });
      setLocationIds({
        country_id: (address.country_id as any)?._id || address.country_id || "",
        province_id: (address.province_id as any)?._id || address.province_id || "",
        district_id: (address.district_id as any)?._id || address.district_id || "",
        ward_id: (address.ward_id as any)?._id || address.ward_id || "",
      });
      setQuickSearchValue(""); 
    } else {
      setFormData({
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
  }, [address, open]);

  // Handle quick location selection from Autocomplete
  const handleQuickLocationSelect = (suggestion: LocationSuggestion) => {
    console.log("Selected suggestion LOG:", suggestion);
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

    console.log("New IDs to set:", newIds);
    setLocationIds(newIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        address_detail: formData.location,
      };

      if (locationIds.country_id) payload.country_id = locationIds.country_id;
      if (locationIds.province_id) payload.province_id = locationIds.province_id;
      if (locationIds.district_id) payload.district_id = locationIds.district_id;
      if (locationIds.ward_id) payload.ward_id = locationIds.ward_id;

      if (address) {
        await addressesApi.update(address._id, payload);
      } else {
        await addressesApi.create(payload);
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Lỗi khi lưu địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{address ? "Sửa Địa chỉ" : "Thêm Địa chỉ mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
             <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Tìm kiếm nhanh địa điểm (Tự động điền)</label>
                <LocationAutocomplete 
                  value={quickSearchValue} 
                  onChange={setQuickSearchValue} 
                  onSelectLocation={handleQuickLocationSelect}
                  placeholder="Nhập Phường/Xã, Quận/Huyện..."
                  className="w-full"
                />
             </div>
             
             <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">Chi tiết hành chính</span>
                </div>
              </div>

             <LocationSelector 
                initialValues={locationIds}
                onChange={(values) => setLocationIds(prev => ({ ...prev, ...values }))}
             />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-red-500">*</span></label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: 144 Xuân Thủy"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : address ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
