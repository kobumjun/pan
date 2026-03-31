import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "익명 자랑 인증",
  description: "친구들한텐 못 자랑하는 것들을 올리는 익명 자랑 커뮤니티"
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
        <main className="mt-3">
          {children}
        </main>
      </body>
    </html>
  );
}

