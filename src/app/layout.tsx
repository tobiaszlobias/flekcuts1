// layout.tsx - Add this metadataBase to fix the warning
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://flekcuts.cz" // Replace with your actual domain when you have one
      : "http://localhost:3000"
  ),
  title: "FlekCuts - Moderní holictví v Bruntále | Fade, Stříhy, Vousy",
  description:
    "Profesionální holictví FlekCuts v Bruntále. Fade střihy, klasické střihy, úprava vousů, dětské střihy. Online objednávky na Zámeckém náměstí 19. ☎️ +420 778 779 938",
  keywords: [
    "holictví Bruntál",
    "barber shop Bruntál",
    "fade střih Bruntál",
    "střih vlasů Bruntál",
    "úprava vousů Bruntál",
    "FlekCuts",
    "holič Bruntál",
    "moderní střihy",
    "online objednávky holictví",
  ].join(", "),
  authors: [{ name: "FlekCuts Bruntál" }],
  creator: "FlekCuts",
  publisher: "FlekCuts",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "FlekCuts",
    title: "FlekCuts - Moderní holictví v Bruntále",
    description:
      "Profesionální fade střihy, úprava vousů a péče o vlasy v Bruntále. Online objednávky 24/7.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FlekCuts - Moderní holictví v Bruntále",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlekCuts - Moderní holictví v Bruntále",
    description:
      "Profesionální fade střihy, úprava vousů a péče o vlasy v Bruntále. Online objednávky 24/7.",
    images: ["/og-image.jpg"],
  },
  other: {
    "business:contact_data:locality": "Bruntál",
    "business:contact_data:region": "Moravskoslezský kraj",
    "business:contact_data:country_name": "Česká republika",
    "business:contact_data:phone_number": "+420778779938",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <meta name="geo.region" content="CZ-80" />
        <meta name="geo.placename" content="Bruntál" />
        <meta name="geo.position" content="49.9884;17.4647" />
        <meta name="ICBM" content="49.9884,17.4647" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HairSalon",
              name: "FlekCuts",
              description:
                "Profesionální holictví specializující se na fade střihy, klasické střihy a úpravu vousů",
              url:
                process.env.NODE_ENV === "production"
                  ? "https://flekcuts.cz"
                  : "http://localhost:3000",
              telephone: "+420778779938",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Zámecké náměstí 19",
                addressLocality: "Bruntál",
                addressRegion: "Moravskoslezský kraj",
                postalCode: "79201",
                addressCountry: "CZ",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 49.9884,
                longitude: 17.4647,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Friday"],
                  opens: "09:00",
                  closes: "11:45",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Friday"],
                  opens: "13:00",
                  closes: "17:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Thursday",
                  opens: "13:00",
                  closes: "21:00",
                },
              ],
              priceRange: "150-500 CZK",
              paymentAccepted: "Cash, Card",
              currenciesAccepted: "CZK",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 to-blue-50`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <Navbar />
            {children}
            <Toaster />
            <SpeedInsights />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
