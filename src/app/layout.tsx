import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhoneCall from "@/components/PhoneCall";
import NoticeButton from "@/components/NoticeButton";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { FAQProvider } from "@/contexts/FAQContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import VisitorTracker from "@/components/VisitorTracker";
import GlobalAlertProvider from "@/components/GlobalAlertProvider";

export const metadata: Metadata = {
  title: "골프상회 - 골프용품 전문 도매몰",
  description: "골프용품 전문 도매몰 골프상회입니다. 드라이버, 아이언, 퍼터 등 다양한 골프용품을 만나보세요.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <FAQProvider>
                  <SettingsProvider>
                    <GlobalAlertProvider>
                      <AuthGuard>
                        <VisitorTracker />
                        <Header />
                        <main>
                          {children}
                        </main>
                        <Footer />
                        <NoticeButton />
                        <PhoneCall />
                      </AuthGuard>
                    </GlobalAlertProvider>
                  </SettingsProvider>
                </FAQProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
