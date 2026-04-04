import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PAN — 실행형 정보 커뮤니티",
  description:
    "자기계발·사업·돈·운동·AI·루틴 등 실행과 정보를 빠르게 공유하는 커뮤니티"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="min-h-[calc(100vh-3.5rem)] bg-[#f4f4f5]">{children}</main>
      </body>
    </html>
  );
}
