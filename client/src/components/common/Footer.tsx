export function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
           <div>
              <h3 className="font-bold text-gray-900 mb-4">Về VivuTravel</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                 <li><a href="#" className="hover:underline">Cách đặt chỗ</a></li>
                 <li><a href="#" className="hover:underline">Liên hệ chúng tôi</a></li>
                 <li><a href="#" className="hover:underline">Trợ giúp</a></li>
                 <li><a href="#" className="hover:underline">Tuyển dụng</a></li>
                 <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
              </ul>
           </div>
           <div>
              <h3 className="font-bold text-gray-900 mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                 <li><a href="#" className="hover:underline">Khách sạn</a></li>
                 <li><a href="#" className="hover:underline">Vé máy bay</a></li>
                 <li><a href="#" className="hover:underline">Đưa đón sân bay</a></li>
                 <li><a href="#" className="hover:underline">Biệt thự</a></li>
                 <li><a href="#" className="hover:underline">Căn hộ</a></li>
              </ul>
           </div>
           <div>
              <h3 className="font-bold text-gray-900 mb-4">Khác</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                 <li><a href="#" className="hover:underline">VivuTravel Affiliate</a></li>
                 <li><a href="#" className="hover:underline">Blog</a></li>
                 <li><a href="#" className="hover:underline">Chính sách quyền riêng tư</a></li>
                 <li><a href="#" className="hover:underline">Điều khoản & Điều kiện</a></li>
              </ul>
           </div>
           <div>
              <h3 className="font-bold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
              <div className="flex gap-4 mb-4">
                 {/* Social placeholders */}
                 <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                 <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                 <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-600">Tải ứng dụng VivuTravel ngay</p>
           </div>
        </div>
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-100">
          &copy; 2025 VivuTravel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
