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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://peerza-test.vercel.app'),
  title: {
    template: "%s | Peerza",
    default: "Peerza",
  },
  description: "The ultimate social and academic network for Nigerian university students.",
  openGraph: {
    title: "Peerza — Campus Social & Academic Network",
    description: "Connect with university students, share posts, and read course resources on Peerza.",
    url: "https://peerza-test.vercel.app",
    siteName: "Peerza",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Peerza Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Peerza",
    description: "The ultimate social and academic network for Nigerian university students.",
    images: ["/icon-512x512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peerza",
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
import SplashScreen from "@/components/SplashScreen";

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
            <SplashScreen />
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
