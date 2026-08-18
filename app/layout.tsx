import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://inference-engineering-ch2-ch3.jae-one-lim.chatgpt.site"
).replace(/\/$/, "");
const imageUrl = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Inference Engineering — Models × Hardware",
  description:
    "Baseten의 Inference Engineering 2·3장을 모델 계산과 하드웨어 병목의 한 흐름으로 연결한 인터랙티브 딥다이브.",
  openGraph: {
    title: "Inference Engineering — Models × Hardware",
    description:
      "Chapter 2–3 deep dive: attention, roofline, memory, accelerators, and deployment decisions.",
    type: "website",
    url: siteUrl,
    images: [{ url: imageUrl, width: 1731, height: 909, alt: "Inference Engineering — Models × Hardware" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inference Engineering — Models × Hardware",
    description:
      "Attention에서 HBM까지, 모델 구조와 하드웨어 선택을 하나의 성능 계약으로 읽습니다.",
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
