"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType?: string; // "tour", "hotel", "flight", "bus", "airport-transfer"
  itemName?: string;
}

const CONTACT_INFO = {
  hotline: "1900 1234",
  phone: "0123 456 789",
  zalo: "0123 456 789",
  email: "contact@vivutravel.com",
  workingHours: "08:00 - 22:00 hàng ngày",
};

export function ContactDialog({ open, onOpenChange, itemType, itemName }: ContactDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Liên hệ tư vấn
          </DialogTitle>
          {itemName && (
            <p className="text-sm text-gray-500 mt-1">
              {itemType === "tour" && "Tour: "}
              {itemType === "hotel" && "Khách sạn: "}
              {itemType === "flight" && "Chuyến bay: "}
              {itemType === "bus" && "Chuyến xe: "}
              {itemType === "airport-transfer" && "Xe đưa đón: "}
              <span className="font-medium text-gray-700">{itemName}</span>
            </p>
          )}
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {/* Hotline */}
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Hotline (Miễn phí)</div>
                <div className="font-bold text-orange-600 text-lg">{CONTACT_INFO.hotline}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
              onClick={() => handleCopy(CONTACT_INFO.hotline.replace(/\s/g, ""), "hotline")}
            >
              {copiedField === "hotline" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Điện thoại tư vấn</div>
                <div className="font-bold text-blue-600">{CONTACT_INFO.phone}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              onClick={() => handleCopy(CONTACT_INFO.phone.replace(/\s/g, ""), "phone")}
            >
              {copiedField === "phone" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Zalo */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Zalo tư vấn</div>
                <div className="font-bold text-blue-600">{CONTACT_INFO.zalo}</div>
              </div>
            </div>
            <a
              href={`https://zalo.me/${CONTACT_INFO.zalo.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                Mở Zalo
              </Button>
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium text-gray-700">{CONTACT_INFO.email}</div>
              </div>
            </div>
            <a href={`mailto:${CONTACT_INFO.email}${itemName ? `?subject=Tư vấn: ${itemName}` : ""}`}>
              <Button size="sm" variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
                Gửi mail
              </Button>
            </a>
          </div>
        </div>

        {/* Working hours */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <span>⏰ Giờ làm việc: </span>
          <span className="font-medium text-gray-700">{CONTACT_INFO.workingHours}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
