import type { Metadata } from "next";
import { Alexandria, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CartHydration } from "@/components/CartHydration";
import { Navigation } from "@/components/ui/Navigation";
import { SideCart } from "@/components/ui/SideCart";
import { ParticleBackground } from "@/utils/visualEffects";
import { MotionProvider } from "@/components/gsap/MotionProvider";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Luxara",
  description: "Luminous Elegance E-commerce Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} ${cormorant.variable} antialiased`}>
      <body className="min-h-screen flex flex-col text-on-background m-0 p-0 overflow-hidden h-screen">
        <CartHydration>
          <MotionProvider />
          <ParticleBackground />
          <div className="lx dark" id="app" dir="rtl">
            <div className="initial-loader-wrapper">
              <span className="loader"></span>
            </div>
            <Navigation>
              {children}
            </Navigation>
            <SideCart />
          </div>
          <ToastProvider />
        </CartHydration>
      </body>
    </html>
  );
}
