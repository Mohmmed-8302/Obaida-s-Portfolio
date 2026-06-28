import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Obaida — Retro Portfolio",
  description: "Obaida's retro CRT portfolio — video editor and portfolio designer crafting viral short-form content, motion graphics, and portfolio websites.",
  openGraph: {
    title: "Obaida — Retro Portfolio",
    description: "Video editor and portfolio designer. Short-form content that makes people stop scrolling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
