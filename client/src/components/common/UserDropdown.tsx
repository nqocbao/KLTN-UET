"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, ShoppingBag, LogOut, Star, Gift, Palmtree } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserDropdownProps {
  variant?: "white" | "dark";
}

export function UserDropdown({ variant = "white" }: UserDropdownProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const textColor = variant === "white" ? "text-white" : "text-gray-900";
  const hoverBg = variant === "white" ? "hover:bg-white/10" : "hover:bg-gray-100";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${hoverBg} transition-colors focus:outline-none`}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
          {/* Name */}
          <span className={`font-medium ${textColor} hidden md:block`}>
            {user.name}
          </span>
          <ChevronDown className={`w-4 h-4 ${textColor} transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-white rounded-xl shadow-xl border border-gray-100"
        sideOffset={8}
      >
        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link
            href="/account/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Palmtree className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Kỳ nghỉ của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account/points"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">VivuPoint</span>
            </div>
            <span className="text-teal-600 font-semibold text-sm">0 points</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Hồ sơ của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Đơn hàng của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account/reviews"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Star className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Nhận xét của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account/vouchers"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Gift className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Voucher của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 mx-1"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
