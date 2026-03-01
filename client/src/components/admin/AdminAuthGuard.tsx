"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin Authentication Guard
 * Checks JWT token + admin role before rendering children
 */
export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
          router.push("/");
          return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          // Not admin — redirect to home
          router.push("/");
          return;
        }

        // Verify token is a valid JWT (not expired) by checking structure
        const parts = token.split(".");
        if (parts.length !== 3) {
          // Invalid JWT format — clear and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }

        // Decode payload to check expiration
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/");
            return;
          }
        } catch {
          // Malformed token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }

        setIsAuthorized(true);
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
