import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Obaida — Retro Portfolio",
  description: "A Windows XP desktop experience portfolio for Obaida — video editor and portfolio designer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
