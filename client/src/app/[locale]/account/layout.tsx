"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/routing";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Map pathnames to labels
  const getPageLabel = (path: string) => {
    if (path.includes("/orders")) return "Đơn hàng của tôi";
    if (path.includes("/points")) return "VivuPoint";
    if (path.includes("/vouchers")) return "Voucher của tôi";
    if (path.includes("/reviews")) return "Nhận xét của tôi";
    if (path.includes("/vacations")) return "Kỳ nghỉ của tôi";
    return "Hồ sơ của tôi"; // Default
  };

  const currentPageLabel = getPageLabel(pathname);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="blue" />
      
      {/* Main Content */}
      <main className="pt-20 md:pt-32 pb-12">
        <div className="container mx-auto px-4 md:px-20">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: "Tài khoản", href: "/account/profile" },
              { label: currentPageLabel }
            ]}
            className="mb-6"
          />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AccountSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
