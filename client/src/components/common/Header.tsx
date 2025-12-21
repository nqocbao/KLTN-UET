"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, User, HelpCircle, Briefcase, Tag, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/AuthModal";

interface HeaderProps {
  variant?: "transparent" | "opaque" | "blue";
}

export function Header({ variant = "transparent" }: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const getHeaderBackground = () => {
    if (variant === "blue") return "bg-[#1ba0e2]";
    if (variant === "opaque") return "bg-white shadow-md";
    return isScrolled ? "bg-[#1ba0e2] shadow-md" : "bg-transparent";
  };

  const textColorClass = variant === "opaque" && !isScrolled ? "text-gray-900" : "text-white";

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${getHeaderBackground()} ${textColorClass}`}>
      <div className="container mx-auto px-4">
        {/* Top Row: Logo & Utilities */}
        <div className="flex items-center justify-between h-14 border-b border-white/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="VivuTravel Logo" className="w-8 h-8 object-cover rounded-lg" />
            <span className="text-2xl font-bold text-white tracking-tight">VivuTravel</span>
          </Link>

          {/* Right Utilities (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white">
            <div className="flex items-center gap-1 cursor-pointer hover:text-white/80">
              <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-3 object-cover rounded-[2px]" />
              <span>VND</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            <Link href="/" className="flex items-center gap-1 hover:text-white/80">
              <HelpCircle className="w-4 h-4" /> Hỗ trợ
            </Link>
            <Link href="/" className="flex items-center gap-1 hover:text-white/80">
              <Briefcase className="w-4 h-4" /> Hợp tác với chúng tôi
            </Link>

            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="outline" 
                className="h-9 px-4 border-white text-white hover:bg-white/10 hover:text-white bg-transparent font-semibold"
                onClick={() => openAuth("login")}
              >
                <User className="w-4 h-4 mr-2" /> Đăng Nhập
              </Button>
              <Button 
                className="h-9 px-4 bg-[#007ce8] hover:bg-[#006bb3] text-white border-none font-semibold"
                onClick={() => openAuth("register")}
              >
                Đăng ký
              </Button>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="w-6 h-6" />
             </Button>
          </div>
        </div>

        {/* Bottom Row: Navigation (Desktop) */}
        <div className="hidden lg:flex items-center h-12 text-sm font-medium text-white gap-8">
          <Link href="/hotels" className="hover:text-white/80">Khách sạn</Link>
          <Link href="/flights" className="hover:text-white/80">Vé máy bay</Link>
          <Link href="/" className="hover:text-white/80">Vé xe khách</Link>
          <Link href="/" className="hover:text-white/80">Đưa đón sân bay</Link>
          <Link href="/" className="hover:text-white/80">Cho thuê xe</Link>
          <Link href="/" className="hover:text-white/80">Hoạt động & Vui chơi</Link>
          <Link href="/" className="flex items-center gap-1 hover:text-white/80">
            More <ChevronDown className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <AuthModal 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        defaultTab={authTab} 
      />
    </header>
  );
}
