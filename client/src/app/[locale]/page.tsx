import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

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

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            {locale === "vi"
              ? "Chào mừng đến với Admin Dashboard"
              : "Welcome to Admin Dashboard"}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {locale === "vi"
              ? "Vui lòng truy cập /admin để vào trang quản trị"
              : "Please visit /admin to access the admin panel"}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={`/${locale}/admin`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {locale === "vi" ? "Đi đến Admin" : "Go to Admin"}
            </a>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
