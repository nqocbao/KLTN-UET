"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => handleLanguageChange("vi")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
          currentLocale === "vi"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <img 
          src="https://flagcdn.com/w20/vn.png" 
          srcSet="https://flagcdn.com/w40/vn.png 2x" 
          width="20" 
          height="15"
          alt="VN" 
          className="rounded-[2px] object-cover"
        />
        Tiếng Việt
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
          currentLocale === "en"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <img 
          src="https://flagcdn.com/w20/gb.png" 
          srcSet="https://flagcdn.com/w40/gb.png 2x" 
          width="20" 
          height="15"
          alt="UK" 
          className="rounded-[2px] object-cover"
        />
        English
      </button>
    </div>
  );
}
