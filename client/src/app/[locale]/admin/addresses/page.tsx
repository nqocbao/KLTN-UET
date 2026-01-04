"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { addressesApi, type Address } from "@/lib/services";
import { AddressDialog } from "@/components/admin/modals/AddressDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Address[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const tCommon = useTranslations("common");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await addressesApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      } as any);
      if (res.success) {
        setData(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await addressesApi.delete(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Xóa thất bại");
    }
  };

  const openCreateDialog = () => {
    setSelectedAddress(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const getAddressString = (addr: Address) => {
    const parts = [
      addr.address_detail,
      (addr.ward_id as any)?.name,
      (addr.district_id as any)?.name,
      (addr.province_id as any)?.name,
      (addr.country_id as any)?.name,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quản lý Địa chỉ</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý danh sách địa chỉ cụ thể</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <span>➕</span> Thêm mới
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">{tCommon("loading")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chi tiết</TableHead>
                <TableHead>Phường/Xã</TableHead>
                <TableHead>Quận/Huyện</TableHead>
                <TableHead>Tỉnh/TP</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((address) => (
                <TableRow key={address._id}>
                  <TableCell className="font-medium">{address.address_detail || "-"}</TableCell>
                  <TableCell>{(address.ward_id as any)?.name || "-"}</TableCell>
                  <TableCell>{(address.district_id as any)?.name || "-"}</TableCell>
                  <TableCell>{(address.province_id as any)?.name || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(address)} className="mr-2 text-blue-600 hover:text-blue-900">
                      Sửa
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(address._id)} className="text-red-600 hover:text-red-900">
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {totalPages > 1 && (
         <div className="flex justify-center items-center gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span>Trang {currentPage} / {totalPages}</span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
         </div>
      )}

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={fetchData}
        address={selectedAddress}
      />
    </div>
  );
}
