"use client";

import { useState, useEffect } from "react";
import { 
  countriesApi, 
  provincesApi, 
  districtsApi, 
  wardsApi 
} from "@/lib/services";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationSelectorProps {
  initialValues?: {
    country_id?: string;
    province_id?: string;
    district_id?: string;
    ward_id?: string;
  };
  onChange: (values: {
    country_id?: string;
    province_id?: string;
    district_id?: string;
    ward_id?: string;
  }) => void;
}

export function LocationSelector({ initialValues, onChange }: LocationSelectorProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState(initialValues?.country_id || "");
  const [selectedProvince, setSelectedProvince] = useState(initialValues?.province_id || "");
  const [selectedDistrict, setSelectedDistrict] = useState(initialValues?.district_id || "");
  const [selectedWard, setSelectedWard] = useState(initialValues?.ward_id || "");

  // Load Countries on mount
  useEffect(() => {
    countriesApi.getAll({ limit: 100 }).then((res) => {
      if (res.success) setCountries(res.data);
    });
  }, []);

  // Update internal state when initialValues change (e.g. when opening edit dialog)
  useEffect(() => {
    console.log("LocationSelector initialValues changed:", initialValues);

    if (initialValues?.country_id) {
      setSelectedCountry(initialValues.country_id);
      setProvinces([]); // Clear old data
      provincesApi.getAll({ countryId: initialValues.country_id, limit: 100 }).then(res => {
         if(res.success) setProvinces(res.data);
      });
    } else {
        setSelectedCountry("");
        setProvinces([]);
    }

    if (initialValues?.province_id) {
      setSelectedProvince(initialValues.province_id);
      setDistricts([]); // Clear old data
      districtsApi.getAll({ provinceId: initialValues.province_id, limit: 100 }).then(res => {
        if(res.success) setDistricts(res.data);
      });
    } else {
        setSelectedProvince("");
        setDistricts([]);
    }

    if (initialValues?.district_id) {
      setSelectedDistrict(initialValues.district_id);
      setWards([]); // Clear old data
      wardsApi.getAll({ districtId: initialValues.district_id, limit: 100 }).then(res => {
        if(res.success) setWards(res.data);
      });
    } else {
        setSelectedDistrict("");
        setWards([]);
    }

    if (initialValues?.ward_id) {
      setSelectedWard(initialValues.ward_id);
    } else {
        setSelectedWard("");
    }
  }, [initialValues?.country_id, initialValues?.province_id, initialValues?.district_id, initialValues?.ward_id]);


  // Handle Country Change
  const handleCountryChange = (id: string) => {
    setSelectedCountry(id);
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setProvinces([]);
    setDistricts([]);
    setWards([]);
    
    // Explicitly reset children in parent state
    onChange({ 
      country_id: id,
      province_id: "",
      district_id: "",
      ward_id: "" 
    });

    if (id) {
      setProvinces([]); // Ensure clear
      provincesApi.getAll({ countryId: id, limit: 100 }).then((res) => {
        if (res.success) setProvinces(res.data);
      });
    }
  };

  // Handle Province Change
  const handleProvinceChange = (id: string) => {
    setSelectedProvince(id);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    
    // Explicitly reset children in parent state
    onChange({ 
      country_id: selectedCountry,
      province_id: id,
      district_id: "",
      ward_id: "" 
    });

    if (id) {
      setDistricts([]); // Ensure clear
      districtsApi.getAll({ provinceId: id, limit: 100 }).then((res) => {
        if (res.success) setDistricts(res.data);
      });
    }
  };

  // Handle District Change
  const handleDistrictChange = (id: string) => {
    setSelectedDistrict(id);
    setSelectedWard("");
    setWards([]);
    
    // Explicitly reset children in parent state
    onChange({ 
      country_id: selectedCountry,
      province_id: selectedProvince,
      district_id: id,
      ward_id: "" 
    });

    if (id) {
      setWards([]); // Ensure clear
      wardsApi.getAll({ districtId: id, limit: 100 }).then((res) => {
        if (res.success) setWards(res.data);
      });
    }
  };

  // Handle Ward Change
  const handleWardChange = (id: string) => {
    setSelectedWard(id);
    onChange({ 
      country_id: selectedCountry,
      province_id: selectedProvince,
      district_id: selectedDistrict,
      ward_id: id 
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Quốc gia</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn quốc gia" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tỉnh / Thành phố</Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange} disabled={!selectedCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn tỉnh/thành" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Quận / Huyện</Label>
        <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedProvince}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn quận/huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Phường / Xã</Label>
        <Select value={selectedWard} onValueChange={handleWardChange} disabled={!selectedDistrict}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn phường/xã" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w._id} value={w._id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
