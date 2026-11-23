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
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] transition-colors">
      {/* Top Desktop Navigation */}
      <DesktopSidebar />

      {/* Expanded Full-Width Campus Hub Container */}
      <div className="max-w-[1440px] mx-auto lg:px-6 lg:py-6 flex justify-center gap-6 items-start">
        {/* Main Content Card */}
        <main
          className={`w-full min-h-screen lg:min-h-[calc(100vh-7rem)] bg-white dark:bg-[#0A0A0A] lg:rounded-3xl lg:border lg:border-zinc-200/70 lg:dark:border-zinc-800/70 lg:shadow-sm overflow-hidden relative ${
            isMessagesPath ? "lg:flex-1" : "lg:flex-1 lg:max-w-[820px]"
          }`}
        >
          {children}
        </main>

        {/* Right Campus Pulse Widgets - Hidden on Messages path */}
        {!isMessagesPath && <DesktopWidgets />}
      </div>
    </div>
  );
}
