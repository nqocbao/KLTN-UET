import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export const metadata: Metadata = {
  title: "Admin Dashboard - Travel Management",
  description: "Admin dashboard for travel management system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Navbar />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
