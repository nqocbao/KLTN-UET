import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/common/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { TopDestinations } from "@/components/home/TopDestinations";
import { HomeDynamicSection } from "@/components/home/HomeDynamicSection";
import { Footer } from "@/components/common/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "vi")) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <HomeDynamicSection />
          <TopDestinations />
          {/* Why Book with us */}
        <section className="bg-white border-t border-gray-100 py-16 mb-10 shadow-2xl">
          <div className="container mx-auto px-4">
             <h2 className="text-2xl font-bold text-center mb-12">Tại sao nên đặt chỗ với VivuTravel?</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { title: "Giá rẻ mỗi ngày với ưu đãi đặc biệt dành riêng cho ứng dụng", desc: "Đặt phòng qua ứng dụng để nhận giá tốt nhất với các khuyến mãi tuyệt vời!", icon: "🏷️" },
                  { title: "Phương thức thanh toán an toàn và linh hoạt", desc: "Giao dịch trực tuyến an toàn với nhiều lựa chọn như thanh toán tại cửa hàng tiện lợi, chuyển khoản ngân hàng...", icon: "💳" },
                  { title: "Hỗ trợ khách hàng 24/7", desc: "Đội ngũ nhân viên hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn trong từng bước của quá trình đặt vé.", icon: "☎️" },
                  { title: "Khách thực, đánh giá thực", desc: "Hơn 10.000.000 đánh giá bởi du khách sẽ giúp bạn đưa ra lựa chọn đúng đắn.", icon: "⭐" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">{item.icon}</div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
