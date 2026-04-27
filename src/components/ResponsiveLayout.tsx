"use client";

import DesktopSidebar from "./DesktopSidebar";
import DesktopWidgets from "./DesktopWidgets";
import { usePathname } from "next/navigation";

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // List of paths where we DON'T want the main layout (e.g., auth pages, onboarding)
  const noLayoutPaths = ["/welcome", "/login", "/onboarding"];
  const shouldShowLayout = !noLayoutPaths.some(path => pathname.startsWith(path));

  if (!shouldShowLayout) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <div className="max-w-[1300px] mx-auto flex justify-center">
        {/* Left Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content Area */}
        <main className="w-full max-w-[600px] border-x border-zinc-100 dark:border-zinc-800 min-h-screen relative">
          {children}
        </main>
        
        {/* Right Sidebar */}
        <DesktopWidgets />
      </div>
    </div>
  );
}
