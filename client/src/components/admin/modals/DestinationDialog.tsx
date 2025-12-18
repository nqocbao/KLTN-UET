"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countriesApi } from "@/lib/services";
import type { Destination, Country } from "@/types/api";

interface DestinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  destination?: Destination | null;
}

export function DestinationDialog({ open, onOpenChange, onSave, destination }: DestinationDialogProps) {
  const [formData, setFormData] = useState({ name: "", country_id: "", description: "", banner_url: "", logo_url: "" });
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    countriesApi.getAll({ limit: 1000 }).then((res) => {
      if (res.success) setCountries(res.data);
    });
  }, []);

  useEffect(() => {
    if (destination) {
      const dest = destination as any;
      setFormData({ name: dest.name || "", country_id: dest.country_id?._id || dest.country_id || "", description: dest.description || "", banner_url: dest.banner_url || "", logo_url: dest.logo_url || "" });
    } else {
      setFormData({ name: "", country_id: "", description: "", banner_url: "", logo_url: "" });
    }
  }, [destination, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{destination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select value={formData.country_id} onValueChange={(value) => setFormData({ ...formData, country_id: value })}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country._id} value={country._id}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Banner URL</label>
              <Input value={formData.banner_url} onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : destination ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
