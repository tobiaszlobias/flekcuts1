// layout.tsx - Add this metadataBase to fix the warning
import type { Metadata } from "next";
import { Crimson_Text, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import AnalyticsGate from "@/components/AnalyticsGate";
import ConsentBanner from "@/components/ConsentBanner";

const crimson = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://flekcuts.cz" // Replace with your actual domain when you have one
      : "http://localhost:3000",
  ),
  title: "FlekCuts - Moderní holičství v Bruntále | Fade, Střihy, Vousy",
  description:
    "Profesionální holičství FlekCuts v Bruntále. Fade střihy, klasické střihy, úprava vousů, dětské střihy. Online objednávky na Zámeckém náměstí 19. ☎️ +420 778 779 938",
  keywords: [
    "holičství Bruntál",
    "barber shop Bruntál",
    "fade střih Bruntál",
    "střih vlasů Bruntál",
    "úprava vousů Bruntál",
    "FlekCuts",
    "holič Bruntál",
    "moderní střihy",
    "online objednávky holičství",
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
    title: "FlekCuts - Moderní holičství v Bruntále",
    description:
      "Profesionální fade střihy, úprava vousů a péče o vlasy v Bruntále. Online objednávky 24/7.",
    images: [
      {
        url: "/logo.png",
        width: 1600,
        height: 896,
        alt: "FlekCuts - Moderní holičství v Bruntále",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlekCuts - Moderní holičství v Bruntále",
    description:
      "Profesionální fade střihy, úprava vousů a péče o vlasy v Bruntále. Online objednávky 24/7.",
    images: ["/logo.png"],
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
    <html lang="cs" className={`${crimson.variable} ${montserrat.variable}`}>
      <head>
        <meta name="geo.region" content="CZ-80" />
        <meta name="geo.placename" content="Bruntál" />
        <meta name="geo.position" content="49.9884;17.4647" />
        <meta name="ICBM" content="49.9884,17.4647" />

        {/* Note: third-party resources (e.g., Google Maps) are gated by user consent */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HairSalon",
              name: "FlekCuts",
              description:
                "Profesionální holičství specializující se na fade střihy, klasické střihy a úpravu vousů",
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
                  closes: "19:30",
                },
              ],
              priceRange: "150-500 CZK",
              paymentAccepted: "Cash, Card",
              currenciesAccepted: "CZK",
            }),
          }}
        />
      </head>
      <body>
        <ClerkProvider
          appearance={{
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
            variables: {
              colorPrimary: "#FF6B35",
              colorText: "#1f2937",
              colorTextSecondary: "#6b7280",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#1f2937",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontFamilyButtons: "var(--font-montserrat), sans-serif",
              borderRadius: "0.75rem",
            },
            elements: {
              formButtonPrimary: {
                backgroundColor: "#FF6B35",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "1rem",
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#FF6B35",
                },
                "&:focus": {
                  backgroundColor: "#FF6B35",
                  boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.2)",
                },
                "&:active": {
                  backgroundColor: "#FF6B35",
                },
              },
              card: {
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                borderRadius: "1rem",
              },
              headerTitle: {
                fontFamily: "var(--font-crimson), serif",
                fontStyle: "italic",
                fontSize: "1.875rem",
                fontWeight: "700",
              },
              headerSubtitle: {
                fontFamily: "var(--font-montserrat), sans-serif",
                color: "#6b7280",
              },
              socialButtonsIconButton: {
                borderColor: "#e5e7eb",
                borderRadius: "9999px",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#FF6B35",
                  transform: "scale(1.05)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              },
              footerActionLink: {
                color: "#FF6B35",
                fontWeight: "600",
                "&:hover": {
                  color: "#E5572C",
                },
              },
              formFieldInput: {
                borderColor: "#e5e7eb",
                borderRadius: "0.5rem",
                "&:focus": {
                  borderColor: "#FF6B35",
                  boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
                },
              },
            },
          }}
        >
          <ConvexClientProvider>
            <Navbar />
            {children}
            <Toaster />
            <ConsentBanner />
            <AnalyticsGate />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
