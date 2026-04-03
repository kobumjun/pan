import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PAN — Playlist community",
  description: "Spotify · YouTube 플레이리스트를 공유하고 발견하는 커뮤니티"
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
        <main className="min-h-[calc(100vh-4rem)] bg-pan-page">{children}</main>
      </body>
    </html>
  );
}

