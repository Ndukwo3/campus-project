"use client";

import DesktopSidebar from "./DesktopSidebar";
import DesktopWidgets from "./DesktopWidgets";
import { usePathname } from "next/navigation";

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // List of paths where we DON'T want the main layout (e.g., auth pages, onboarding)
  const noLayoutPaths = ["/welcome", "/login", "/onboarding"];
  const shouldShowLayout = !noLayoutPaths.some(path => pathname.startsWith(path));

  const isMessagesPath = pathname.startsWith("/messages");

  if (!shouldShowLayout) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <div className={`mx-auto flex justify-center ${isMessagesPath ? 'max-w-[1300px]' : 'max-w-[1300px]'}`}>
        {/* Left Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content Area */}
        <main className={`w-full border-x border-zinc-100 dark:border-zinc-800 min-h-screen relative ${isMessagesPath ? 'max-w-[1000px]' : 'max-w-[600px]'}`}>
          {children}
        </main>
        
        {/* Right Sidebar - Hidden on Messages path to give space */}
        {!isMessagesPath && <DesktopWidgets />}
      </div>
    </div>
  );
}
