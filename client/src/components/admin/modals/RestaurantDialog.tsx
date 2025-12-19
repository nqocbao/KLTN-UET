"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Restaurant } from "@/types/api";

interface RestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  restaurant?: Restaurant | null;
}

export function RestaurantDialog({ open, onOpenChange, onSave, restaurant }: RestaurantDialogProps) {
  const [formData, setFormData] = useState({ name: "", image_url: "", cuisine: "", rating: 0, priceLevel: 1, location: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({ name: restaurant.name || "", image_url: restaurant.image_url || "", cuisine: restaurant.cuisine || "", rating: restaurant.rating || 0, priceLevel: restaurant.priceLevel || 1, location: restaurant.location || "", description: restaurant.description || "" });
    } else {
      setFormData({ name: "", image_url: "", cuisine: "", rating: 0, priceLevel: 1, location: "", description: "" });
    }
  }, [restaurant, open]);

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
          <DialogTitle>{restaurant ? "Edit Restaurant" : "Add New Restaurant"}</DialogTitle>
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
            <label className="text-sm font-medium">Cuisine</label>
            <Input value={formData.cuisine} onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} placeholder="e.g., Vietnamese, Japanese" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Level</label>
              <Select value={formData.priceLevel.toString()} onValueChange={(value) => setFormData({ ...formData, priceLevel: parseInt(value) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$ - Budget</SelectItem>
                  <SelectItem value="2">$$ - Moderate</SelectItem>
                  <SelectItem value="3">$$$ - Expensive</SelectItem>
                  <SelectItem value="4">$$$$ - Very Expensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : restaurant ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
