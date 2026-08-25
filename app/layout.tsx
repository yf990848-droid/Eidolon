import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Eidolon · 私人小说创作室", template: "%s · Eidolon" },
  description: "从灵感、大纲到完整小说，让故事找到它的声音。",
  openGraph: {
    title: "Eidolon · 私人小说创作室",
    description: "从灵感、大纲到完整小说，让故事找到它的声音。",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eidolon · 私人小说创作室",
    description: "从灵感、大纲到完整小说，让故事找到它的声音。",
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
