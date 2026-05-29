import type { Metadata } from "next";
import { Tajawal, Cormorant_Garamond, Outfit } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CartHydration } from "@/components/CartHydration";
import { Navigation } from "@/components/ui/Navigation";
import { ParticleBackground } from "@/utils/visualEffects";
import { MotionProvider } from "@/components/gsap/MotionProvider";
import { SystemSetup } from "@/components/SystemSetup";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { LenisProvider } from "@/components/ui/LenisProvider";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Qissa | قصة - متجر التسوق الفاخر في الجزائر",
  description: "قصة - كل منتج يضيف فصلاً جديداً لقصتك. اكتشف متعة التسوق الفاخر في الجزائر.",
  keywords: ["تسوق عبر الإنترنت", "قصة", "الجزائر", "ملابس", "Qissa", "E-commerce Algeria"],
  openGraph: {
    title: "Qissa | قصة - متجر التسوق الفاخر",
    description: "اكتشف أفضل العروض والمنتجات المميزة في الجزائر وتوصيل لجميع الولايات.",
    url: "https://qissah.qzz.io",
    siteName: "Qissa",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Qissa Store",
      },
    ],
    locale: "ar_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qissa | قصة - متجر التسوق الفاخر",
    description: "اكتشف أفضل العروض والمنتجات المميزة في الجزائر.",
    images: ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&w=1200&h=630&q=80"],
  },
};

const storeSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Qissa | قصة",
  "image": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
  "description": "قصة - كل منتج يضيف فصلاً جديداً لقصتك. اكتشف متعة التسوق الفاخر في الجزائر.",
  "url": "https://qissah.qzz.io",
  "telephone": "+213000000000",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "الجزائر العاصمة",
    "addressLocality": "الجزائر",
    "addressCountry": "DZ"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cormorant.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        `}} />
      </head>
      <body className="min-h-screen flex flex-col text-on-background m-0 p-0 overflow-hidden h-screen">
        <SplashScreen />
        <CartHydration>
          <SystemSetup />
          <MotionProvider />
          <ParticleBackground />
          <LenisProvider>
            <div className="lx" id="app" dir="rtl">
              <div className="initial-loader-wrapper">
                <span className="loader"></span>
              </div>
              <Navigation>
                {children}
              </Navigation>
            </div>
          </LenisProvider>
          <ToastProvider />
        </CartHydration>
      </body>
    </html>
  );
}
