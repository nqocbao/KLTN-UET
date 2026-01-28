"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tour } from "@/types/api";

interface TourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  tour?: Tour | null;
}

export function TourDialog({ open, onOpenChange, onSave, tour }: TourDialogProps) {
  const [formData, setFormData] = useState({ name: "", description: "", adult_price: 0, child_price: 0, duration_days: 0, capacity: 0, destination: "", status: "active" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tour) {
      setFormData({ name: tour.name || "", description: tour.description || "", adult_price: tour.adult_price || 0, child_price: tour.child_price || 0, duration_days: tour.duration_days || 0, capacity: tour.capacity || 0, destination: tour.destination || "", status: tour.status || "active" });
    } else {
      setFormData({ name: "", description: "", adult_price: 0, child_price: 0, duration_days: 0, capacity: 0, destination: "", status: "active" });
    }
  }, [tour, open]);

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
          <DialogTitle>{tour ? "Edit Tour" : "Add New Tour"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tour Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Adult Price (VND)</label>
              <Input type="number" min="0" value={formData.adult_price} onChange={(e) => setFormData({ ...formData, adult_price: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Child Price (VND)</label>
              <Input type="number" min="0" value={formData.child_price} onChange={(e) => setFormData({ ...formData, child_price: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (days)</label>
              <Input type="number" min="1" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity</label>
            <Input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : tour ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
