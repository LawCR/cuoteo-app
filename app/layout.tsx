import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/core/env";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { Toaster } from "@/shared/components/ui/sonner";
import {
  APP_DEFAULT_DESCRIPTION,
  APP_NAME,
} from "@/shared/utils/page-metadata.utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DEFAULT_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DEFAULT_DESCRIPTION,
    siteName: APP_NAME,
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider
          publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <ThemeProvider>
            <div className="flex min-h-full flex-1 flex-col">
              {children}
              <Toaster richColors position="top-right" duration={3000} />
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
