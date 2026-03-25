import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus - Uni-verse",
  description: "The ultimate social and academic network for Nigerian university students.",
};

import { GlobalModals } from "@/components/GlobalModals";
import GlobalStateLoader from "@/components/GlobalStateLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingCreateButton from "@/components/FloatingCreateButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalStateLoader />
          {children}
          <FloatingCreateButton />
          <GlobalModals />
        </ThemeProvider>
      </body>
    </html>
  );
}
