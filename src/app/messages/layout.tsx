"use client";

import ChatSidebar from "@/components/ChatSidebar";
import { usePathname } from "next/navigation";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIndividualChat = pathname.split('/').length > 2; // e.g. /messages/[id]

  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      {/* Sidebar - Visible on desktop always, on mobile only if not in individual chat */}
      <div className={`${isIndividualChat ? 'hidden lg:block' : 'block w-full lg:w-auto'}`}>
        <ChatSidebar />
      </div>

      {/* Main Content (Chat Window) - Visible on desktop always, on mobile only if in individual chat */}
      <div className={`flex-1 h-full bg-[#FDFDFD] dark:bg-[#050505] transition-colors ${!isIndividualChat ? 'hidden lg:flex' : 'flex'}`}>
        {children}
      </div>
    </div>
  );
}
