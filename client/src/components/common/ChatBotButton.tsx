"use client";

import { Headset } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function ChatBotButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Extract locale from current pathname (e.g. /vi/tours → vi)
  const locale = pathname.split("/")[1] || "vi";

  // Hide button when already on the chatbot page
  if (pathname.includes("/chatbot")) return null;

  const handleClick = () => {
    router.push(`/${locale}/chatbot`);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Mở trợ lý lịch trình"
      className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-[#0194f3] rounded-full flex items-center justify-center shadow-xl hover:bg-[#0180d9] hover:scale-110 active:scale-95 transition-all duration-200"
    >
      <Headset className="w-6 h-6 text-white" />
    </button>
  );
}
