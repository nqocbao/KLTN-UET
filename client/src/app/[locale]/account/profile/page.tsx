"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Camera, Check, X } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  billingInfo?: {
    taxCode?: string;
    companyName?: string;
    companyAddress?: string;
  };
}

interface ProfileField {
  key: keyof UserProfile | "billingInfo";
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  editable?: boolean;
  subtext?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = (field: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: editValue };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    setEditingField(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profileFields: ProfileField[] = [
    {
      key: "name",
      label: "Họ tên",
      value: user.name || "",
      placeholder: "Nhập họ tên của bạn",
      editable: true,
    },
    {
      key: "email",
      label: "Địa chỉ email",
      value: user.email || "",
      placeholder: "Nhập email của bạn",
      type: "email",
      editable: false,
      subtext: "Đây là email Quý khách đã xác thực. VivuTravel sẽ gửi các xác nhận đến địa chỉ email này",
    },
    {
      key: "phone",
      label: "Số điện thoại",
      value: user.phone || "",
      placeholder: "Thêm số điện thoại của bạn",
      editable: true,
      subtext: "VivuTravel sẽ liên lạc với Quý khách đến số điện thoại này",
    },
    {
      key: "birthday",
      label: "Ngày sinh",
      value: user.birthday || "",
      placeholder: "Nhập ngày sinh của bạn",
      type: "date",
      editable: true,
    },
    {
      key: "gender",
      label: "Giới tính",
      value: user.gender || "",
      placeholder: "Nhập giới tính của bạn",
      editable: true,
    },
    {
      key: "address",
      label: "Địa chỉ",
      value: user.address || "",
      placeholder: "Nhập địa chỉ",
      editable: true,
    },
    {
      key: "billingInfo",
      label: "Thông tin xuất hóa đơn điện tử",
      value: user.billingInfo?.companyName || "",
      placeholder: "Chưa cung cấp",
      editable: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Thông tin cá nhân</h1>
          <p className="text-gray-500 mt-1">
            Lưu thông tin của Quý khách để đặt dịch vụ nhanh hơn
          </p>
        </div>
        
        {/* Avatar */}
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <Camera className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="divide-y divide-gray-100">
        {profileFields.map((field) => (
          <div
            key={field.key}
            className="px-8 py-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-500 block mb-1">
                {field.label}
              </label>
              
              {editingField === field.key ? (
                <div className="flex items-center gap-2">
                  <Input
                    type={field.type || "text"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleSave(field.key)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {field.value ? (
                    <p className="text-gray-900 font-medium">{field.value}</p>
                  ) : (
                    <p className="text-blue-600">{field.placeholder}</p>
                  )}
                  {field.subtext && (
                    <p className="text-sm text-gray-400 mt-0.5">{field.subtext}</p>
                  )}
                </>
              )}
            </div>

            {field.editable && editingField !== field.key && (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                onClick={() => handleEdit(field.key, field.value)}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
