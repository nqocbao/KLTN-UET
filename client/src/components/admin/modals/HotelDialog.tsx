"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/types/api";

interface HotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  hotel?: Hotel | null;
}

export function HotelDialog({ open, onOpenChange, onSave, hotel }: HotelDialogProps) {
  const [formData, setFormData] = useState({ name: "", image_url: "", location: "", rating: 0, rooms: 0, priceRange: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotel) {
      setFormData({ name: hotel.name || "", image_url: hotel.image_url || "", location: hotel.location || "", rating: hotel.rating || 0, rooms: hotel.rooms || 0, priceRange: hotel.priceRange || "", description: hotel.description || "" });
    } else {
      setFormData({ name: "", image_url: "", location: "", rating: 0, rooms: 0, priceRange: "", description: "" });
    }
  }, [hotel, open]);

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
          <DialogTitle>{hotel ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rooms</label>
              <Input type="number" min="0" value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <Input value={formData.priceRange} onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })} placeholder="e.g., $100-$200" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : hotel ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
