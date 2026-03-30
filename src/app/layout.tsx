import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Campus",
    default: "Campus - Uni-verse",
  },
  description: "The ultimate social and academic network for Nigerian university students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campus",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    google: "notranslate",
  },
};

import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import GlobalStateLoader from "@/components/GlobalStateLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalModals } from "@/components/GlobalModals";
import FloatingCreateButton from "@/components/FloatingCreateButton";
import Script from "next/script";
import Providers from "@/components/Providers";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="notranslate" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}
      >
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
