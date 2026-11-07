import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://passportsnapp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PassportSnap: Free Passport Photo Maker, Resize & Compress Online",
    template: "%s | PassportSnap",
  },
  description:
    "Free online passport photo maker. Upload a photo, crop it to passport or visa size (35x45 mm, 2x2 inch and more), compress it to a target file size and download or print. Private: your photo never leaves your browser.",
  applicationName: "PassportSnap",
  keywords: [
    "passport photo maker",
    "passport size photo online",
    "passport photo resize",
    "compress passport photo",
    "passport photo 35x45 mm",
    "passport photo 2x2 inch",
    "visa photo maker",
    "ID photo maker",
    "photo resizer in KB",
    "free passport photo",
  ],
  authors: [{ name: "PassportSnap" }],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PassportSnap",
    title: "PassportSnap: Free Passport Photo Maker, Resize & Compress Online",
    description:
      "Crop, resize and compress passport and ID photos in your browser. Free, fast and private.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PassportSnap: Free Passport Photo Maker",
    description:
      "Crop, resize and compress passport and ID photos in your browser. Free, fast and private.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <Toaster />
      </body>
    </html>
  );
}
