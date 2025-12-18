"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Airline } from "@/lib/services/other.service";

interface AirlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  airline?: Airline | null;
}

export function AirlineDialog({ open, onOpenChange, onSave, airline }: AirlineDialogProps) {
  const [formData, setFormData] = useState({ name: "", code: "", country: "", logo: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (airline) {
      setFormData({ name: airline.name || "", code: airline.code || "", country: airline.country || "", logo: airline.logo || "" });
    } else {
      setFormData({ name: "", code: "", country: "", logo: "" });
    }
  }, [airline, open]);

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
          <DialogTitle>{airline ? "Edit Airline" : "Add New Airline"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo URL</label>
            <Input value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : airline ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
