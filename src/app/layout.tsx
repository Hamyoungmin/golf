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
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  title: "골프상회 - 골프용품 전문 도매몰",
  description: "골프용품 전문 도매몰 골프상회입니다. 드라이버, 아이언, 퍼터 등 다양한 골프용품을 만나보세요.",
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
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
