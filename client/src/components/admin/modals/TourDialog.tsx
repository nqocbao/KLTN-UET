"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import type { Tour, ItineraryDay, IncludedServicesDetail } from "@/types/api";

interface TourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  tour?: Tour | null;
}

interface FormData {
  name: string;
  tour_code: string;
  description: string;
  adult_price: number;
  child_price: number;
  duration_days: number;
  rating: number;
  status: string;
  itinerary: ItineraryDay[];
  included_services_detail: IncludedServicesDetail;
  excluded_services: string[];
  images: string[];
  banner_url: string;
}

const defaultFormData: FormData = {
  name: "",
  tour_code: "",
  description: "",
  adult_price: 0,
  child_price: 0,
  duration_days: 1,
  rating: 4.5,
  status: "active",
  itinerary: [],
  included_services_detail: {
    transport: "",
    accommodation: "",
    meals: "",
    guide: "",
    extras: []
  },
  excluded_services: [],
  images: [],
  banner_url: ""
};

export function TourDialog({ open, onOpenChange, onSave, tour }: TourDialogProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (tour) {
      setFormData({
        name: tour.name || "",
        tour_code: tour.tour_code || "",
        description: tour.description || "",
        adult_price: tour.adult_price || 0,
        child_price: tour.child_price || 0,
        duration_days: tour.duration_days || 1,
        rating: tour.rating || 4.5,
        status: tour.status || "active",
        itinerary: tour.itinerary || [],
        included_services_detail: tour.included_services_detail || {
          transport: "",
          accommodation: "",
          meals: "",
          guide: "",
          extras: []
        },
        excluded_services: tour.excluded_services || [],
        images: tour.images || [],
        banner_url: tour.banner_url || ""
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab("basic");
  }, [tour, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle duration change - auto generate itinerary days
  const handleDurationChange = (newDuration: number) => {
    const currentItinerary = [...formData.itinerary];
    const currentLength = currentItinerary.length;
    
    if (newDuration > currentLength) {
      // Thêm các ngày mới
      for (let i = currentLength + 1; i <= newDuration; i++) {
        currentItinerary.push({
          day: i,
          title: "",
          description: "",
          meals: [],
          image: ""
        });
      }
    } else if (newDuration < currentLength) {
      // Xóa bớt các ngày cuối
      currentItinerary.splice(newDuration);
    }
    
    setFormData({
      ...formData,
      duration_days: newDuration,
      itinerary: currentItinerary
    });
  };

  // Itinerary handlers
  const addItineraryDay = () => {
    if (formData.itinerary.length >= formData.duration_days) return;
    const nextDay = formData.itinerary.length + 1;
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, { day: nextDay, title: "", description: "", meals: [], image: "" }]
    });
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, itinerary: updated });
  };

  const removeItineraryDay = (index: number) => {
    if (formData.itinerary.length <= 1) return;
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    // Re-number days
    newItinerary.forEach((item, i) => {
      item.day = i + 1;
    });
    setFormData({
      ...formData,
      itinerary: newItinerary,
      duration_days: newItinerary.length
    });
  };

  // Excluded services handlers
  const addExcludedService = () => {
    setFormData({
      ...formData,
      excluded_services: [...formData.excluded_services, ""]
    });
  };

  const updateExcludedService = (index: number, value: string) => {
    const updated = [...formData.excluded_services];
    updated[index] = value;
    setFormData({ ...formData, excluded_services: updated });
  };

  const removeExcludedService = (index: number) => {
    setFormData({
      ...formData,
      excluded_services: formData.excluded_services.filter((_, i) => i !== index)
    });
  };

  // Extras handlers
  const addExtra = () => {
    setFormData({
      ...formData,
      included_services_detail: {
        ...formData.included_services_detail,
        extras: [...(formData.included_services_detail.extras || []), ""]
      }
    });
  };

  const updateExtra = (index: number, value: string) => {
    const updated = [...(formData.included_services_detail.extras || [])];
    updated[index] = value;
    setFormData({
      ...formData,
      included_services_detail: { ...formData.included_services_detail, extras: updated }
    });
  };

  const removeExtra = (index: number) => {
    setFormData({
      ...formData,
      included_services_detail: {
        ...formData.included_services_detail,
        extras: formData.included_services_detail.extras?.filter((_, i) => i !== index) || []
      }
    });
  };

  // Images handlers
  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const updateImage = (index: number, value: string) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{tour ? "Chỉnh sửa Tour" : "Thêm Tour mới"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex ml-3 flex-col">
            <TabsList className="grid grid-cols-5 mb-4 flex-shrink-0">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
              <TabsTrigger value="included">Bao gồm</TabsTrigger>
              <TabsTrigger value="excluded">Không bao gồm</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Tên Tour *</label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      placeholder="VD: Tour Hạ Long - Ninh Bình 3N2Đ"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mã Tour</label>
                    <Input 
                      value={tour ? formData.tour_code : "(Tự động sinh khi tạo)"} 
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số ngày *</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="30"
                      value={formData.duration_days === 0 ? "" : formData.duration_days} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setFormData({ ...formData, duration_days: 0 });
                        } else {
                          handleDurationChange(parseInt(val) || 0);
                        }
                      }}
                      onBlur={() => {
                        if (formData.duration_days < 1) {
                          handleDurationChange(1);
                        }
                      }}
                      required 
                    />
                    <p className="text-xs text-gray-500">Lịch trình sẽ tự động tạo theo số ngày</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giá người lớn (VND) *</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={formData.adult_price === 0 ? "" : formData.adult_price} 
                      onChange={(e) => setFormData({ ...formData, adult_price: e.target.value === "" ? 0 : parseFloat(e.target.value) })} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giá trẻ em (VND) *</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={formData.child_price === 0 ? "" : formData.child_price} 
                      onChange={(e) => setFormData({ ...formData, child_price: e.target.value === "" ? 0 : parseFloat(e.target.value) })} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Đánh giá</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1"
                      value={formData.rating === 0 ? "" : formData.rating} 
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value === "" ? 0 : parseFloat(e.target.value) })} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Mô tả / Điểm nổi bật *</label>
                    <Textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      placeholder="Mô tả chi tiết về tour, các điểm nổi bật..."
                      rows={4}
                      required 
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Itinerary Tab */}
              <TabsContent value="itinerary" className="space-y-4 mt-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Chương trình tour theo ngày</h3>
                    <p className="text-sm text-gray-500">
                      {formData.itinerary.length}/{formData.duration_days} ngày đã có lịch trình
                    </p>
                  </div>
                  {formData.itinerary.length < formData.duration_days && (
                    <Button type="button" variant="outline" size="sm" onClick={addItineraryDay}>
                      <Plus className="w-4 h-4 mr-1" /> Thêm ngày
                    </Button>
                  )}
                </div>
                
                {formData.itinerary.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>Chưa có lịch trình.</p>
                    <p className="text-sm mt-1">Vui lòng nhập số ngày ở tab "Thông tin cơ bản" để tự động tạo lịch trình.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.itinerary.map((day, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <span className="font-semibold text-blue-600">
                            Ngày {day.day}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Tiêu đề ngày *</label>
                            <Input 
                              value={day.title}
                              onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                              placeholder="VD: Hà Nội - Hạ Long - Du thuyền 5 sao"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Bữa ăn (phân cách bằng dấu phẩy)</label>
                            <Input 
                              value={day.meals?.join(", ") || ""}
                              onChange={(e) => updateItineraryDay(index, 'meals', e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              placeholder="VD: Sáng, Trưa, Tối"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Mô tả chi tiết</label>
                            <Textarea 
                              value={day.description || ""}
                              onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                              placeholder="Chi tiết hoạt động trong ngày..."
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">URL Hình ảnh</label>
                            <Input 
                              value={day.image || ""}
                              onChange={(e) => updateItineraryDay(index, 'image', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Included Services Tab */}
              <TabsContent value="included" className="space-y-4 mt-0">
                <h3 className="font-semibold mb-4">Giá Tour Bao Gồm</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vận chuyển</label>
                    <Textarea 
                      value={formData.included_services_detail.transport || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        included_services_detail: { ...formData.included_services_detail, transport: e.target.value }
                      })}
                      placeholder="VD: Xe du lịch đời mới 16, 29, 45 chỗ điều hòa suốt tuyến."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lưu trú</label>
                    <Textarea 
                      value={formData.included_services_detail.accommodation || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        included_services_detail: { ...formData.included_services_detail, accommodation: e.target.value }
                      })}
                      placeholder="VD: Khách sạn 3-4 sao, tiêu chuẩn 2 khách/phòng."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ăn uống</label>
                    <Textarea 
                      value={formData.included_services_detail.meals || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        included_services_detail: { ...formData.included_services_detail, meals: e.target.value }
                      })}
                      placeholder="VD: Các bữa ăn theo chương trình, bao gồm buffet hải sản."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hướng dẫn viên</label>
                    <Input 
                      value={formData.included_services_detail.guide || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        included_services_detail: { ...formData.included_services_detail, guide: e.target.value }
                      })}
                      placeholder="VD: HDV tiếng Việt suốt tuyến"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Dịch vụ khác</label>
                      <Button type="button" variant="outline" size="sm" onClick={addExtra}>
                        <Plus className="w-4 h-4 mr-1" /> Thêm
                      </Button>
                    </div>
                    {formData.included_services_detail.extras?.map((extra, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={extra}
                          onChange={(e) => updateExtra(index, e.target.value)}
                          placeholder="VD: Vé tham quan các điểm theo chương trình"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeExtra(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Excluded Services Tab */}
              <TabsContent value="excluded" className="space-y-4 mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Giá Tour Không Bao Gồm</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addExcludedService}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm mục
                  </Button>
                </div>
                
                {formData.excluded_services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    Chưa có mục nào. Nhấn "Thêm mục" để bắt đầu.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.excluded_services.map((service, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={service}
                          onChange={(e) => updateExcludedService(index, e.target.value)}
                          placeholder="VD: Chi phí cá nhân: giặt ủi, điện thoại..."
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeExcludedService(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Banner URL</label>
                    <Input 
                      value={formData.banner_url}
                      onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                    {formData.banner_url && (
                      <img src={formData.banner_url} alt="Banner preview" className="w-full h-32 object-cover rounded-lg mt-2" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Hình ảnh Tour</label>
                      <Button type="button" variant="outline" size="sm" onClick={addImage}>
                        <Plus className="w-4 h-4 mr-1" /> Thêm ảnh
                      </Button>
                    </div>
                    
                    {formData.images.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        Chưa có hình ảnh. Nhấn "Thêm ảnh" để bắt đầu.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.images.map((img, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input 
                                value={img}
                                onChange={(e) => updateImage(index, e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                              />
                              {img && (
                                <img src={img} alt={`Preview ${index + 1}`} className="w-24 h-16 object-cover rounded" />
                              )}
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : tour ? "Lưu thay đổi" : "Tạo Tour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
