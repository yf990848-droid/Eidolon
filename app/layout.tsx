import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "纸境 · 白天属于面包，夜晚属于纸境", template: "%s · 纸境" },
  description: "纸境连接现实与梦境，在这里与 AI 共创，或安静地写下自己的故事。",
  openGraph: {
    title: "纸境 · Eidolon",
    description: "白天属于面包，夜晚属于纸境。",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "纸境 · Eidolon",
    description: "白天属于面包，夜晚属于纸境。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
