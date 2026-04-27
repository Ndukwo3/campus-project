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
    template: "%s | Univas",
    default: "Univas",
  },
  description: "The ultimate social and academic network for Nigerian university students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Univas",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import GlobalStateLoader from "@/components/GlobalStateLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalModals } from "@/components/GlobalModals";
import SessionTracker from "@/components/SessionTracker";
import FloatingCreateButton from "@/components/FloatingCreateButton";
import Script from "next/script";
import Providers from "@/components/Providers";
import ThemeColorUpdater from "@/components/ThemeColorUpdater";



import ResponsiveLayout from "@/components/ResponsiveLayout";

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
          id="google-gsi"
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
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
            <ThemeColorUpdater />
            <GlobalStateLoader />
            <SessionTracker />
            <ResponsiveLayout>
              {children}
            </ResponsiveLayout>
            <GlobalModals />

          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
