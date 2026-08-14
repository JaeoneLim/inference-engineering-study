import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const image = new URL("/og.png", origin).toString();

  return {
    title: "Inference Engineering — Models × Hardware",
    description:
      "Baseten의 Inference Engineering 2·3장을 모델 계산과 하드웨어 병목의 한 흐름으로 연결한 인터랙티브 딥다이브.",
    openGraph: {
      title: "Inference Engineering — Models × Hardware",
      description:
        "Chapter 2–3 deep dive: attention, roofline, memory, accelerators, and deployment decisions.",
      type: "website",
      url: origin,
      images: [{ url: image, width: 1731, height: 909, alt: "Inference Engineering — Models × Hardware" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Inference Engineering — Models × Hardware",
      description:
        "Attention에서 HBM까지, 모델 구조와 하드웨어 선택을 하나의 성능 계약으로 읽습니다.",
      images: [image],
    },
  };
}

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
