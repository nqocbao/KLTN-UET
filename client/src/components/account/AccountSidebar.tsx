"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { User, Gift, ShoppingBag, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    href: "/account/profile",
    label: "Hồ sơ của tôi",
    icon: <User className="w-5 h-5" />,
  },
  {
    href: "/account/points",
    label: "VivuPoint",
    icon: <Gift className="w-5 h-5" />,
  },
  {
    href: "/account/orders",
    label: "Đơn hàng của tôi",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    href: "/account/vouchers",
    label: "Voucher của tôi",
    icon: <Ticket className="w-5 h-5" />,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.includes(href);
  };

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {sidebarItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href as "/account/profile" | "/account/orders" | "/account/points" | "/account/vouchers"}
              className={cn(
                "flex items-center gap-3 px-5 py-4 transition-colors",
                isActive(item.href)
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              )}
            >
              <span
                className={cn(
                  isActive(item.href) ? "text-blue-600" : "text-gray-400"
                )}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
