import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/common/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { TopDestinations } from "@/components/home/TopDestinations";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "vi")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <TopDestinations />
          
          {/* Placeholder for other sections */}
          <div className="container mx-auto px-4 py-12 text-center">
             <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Khám phá thêm</h3>
                <p className="text-gray-500">Nhiều ưu đãi hấp dẫn đang chờ đón bạn.</p>
             </div>
          </div>
        </main>
        
        {/* Simple Footer Placeholder */}
        <footer className="bg-gray-100 py-8 border-t border-gray-200 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; 2025 VivuTravel. All rights reserved.
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
