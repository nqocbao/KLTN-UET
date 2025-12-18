"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transport } from "@/lib/services/other.service";

interface TransportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  transport?: Transport | null;
}

export function TransportDialog({ open, onOpenChange, onSave, transport }: TransportDialogProps) {
  const [formData, setFormData] = useState({ name: "", type: "", capacity: 0, provider: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transport) {
      setFormData({ name: transport.name || "", type: transport.type || "", capacity: transport.capacity || 0, provider: transport.provider || "" });
    } else {
      setFormData({ name: "", type: "", capacity: 0, provider: "" });
    }
  }, [transport, open]);

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
          <DialogTitle>{transport ? "Edit Transport" : "Add New Transport"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Sleeper Bus">Sleeper Bus</SelectItem>
                  <SelectItem value="Train">Train</SelectItem>
                  <SelectItem value="Speed Boat">Speed Boat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity</label>
              <Input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : transport ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
