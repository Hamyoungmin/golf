import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhoneCall from "@/components/PhoneCall";
import NoticeButton from "@/components/NoticeButton";

export const metadata: Metadata = {
  title: "팬더골프 PANDAGOLF - 골프상회 도매몰",
  description: "골프용품 전문 도매몰 팬더골프입니다. 드라이버, 아이언, 퍼터 등 다양한 골프용품을 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <NoticeButton />
        <PhoneCall />
      </body>
    </html>
  );
}
