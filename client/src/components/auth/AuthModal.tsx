"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone } from "lucide-react";

// Inline SVGs for brand icons
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#1976D2" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"/>
    <path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-1.543,0.748-2.434,2.412-2.434l2.63-0.002V14.26C30.912,14.133,29.215,14,27.565,14c-4.714,0-7.554,2.607-7.554,7.535v3.508h-4.79V29.3h4.79v12.721C21.302,42.47,22.635,42.667,24,42.667s2.698-0.197,4-0.646V29.301z"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20px" height="20px" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
  </svg>
);

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  // const t = useTranslations("auth"); // Assuming you'll add translations later
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-gray-900">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-center">
              {activeTab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </DialogTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Đăng nhập hoặc tạo tài khoản để nhận được các ưu đãi độc quyền
            </p>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Tạo tài khoản</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {/* Social Login Buttons */}
              <Button variant="outline" className="w-full h-12 relative border-blue-600 text-blue-600 hover:bg-blue-50">
                <span className="absolute left-4 flex items-center justify-center"><GoogleIcon /></span>
                Đăng nhập bằng Google
              </Button>
              <Button variant="outline" className="w-full h-12 relative border-blue-800 text-blue-800 hover:bg-blue-50">
                 <span className="absolute left-4 flex items-center justify-center"><FacebookIcon /></span>
                Đăng nhập với Facebook
              </Button>
              <Button variant="outline" className="w-full h-12 relative bg-black text-white hover:bg-gray-800">
                 <span className="absolute left-4 flex items-center justify-center"><AppleIcon /></span>
                Đăng nhập bằng Apple
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">hoặc</span>
                </div>
              </div>

              {/* Email/Phone Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email hoặc số điện thoại</label>
                  <Input placeholder="Email hoặc số điện thoại" className="h-12" />
                </div>
                
                {activeTab === "register" && (
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input placeholder="Họ và tên của bạn" className="h-12" />
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-sm font-medium">Mật khẩu</label>
                   <Input type="password" placeholder="Mật khẩu" className="h-12" />
                </div>

                {activeTab === "register" && (
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                     <Input type="password" placeholder="Nhập lại mật khẩu" className="h-12" />
                   </div>
                )}

                <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                  {activeTab === "login" ? "Đăng nhập" : "Tiếp tục"}
                </Button>
              </div>
            </div>
            
             <div className="mt-6 text-center">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                  Đăng nhập bằng cách khác
                </Button>
             </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
