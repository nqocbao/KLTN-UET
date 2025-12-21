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
          <div className="container mx-auto px-4 py-12 text-center">
             <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Khám phá thêm</h3>
                <p className="text-gray-500">Nhiều ưu đãi hấp dẫn đang chờ đón bạn.</p>
             </div>
          </div>
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
