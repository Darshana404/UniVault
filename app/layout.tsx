import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "UniVault — University Academic Resource Platform",
  description:
    "A secure, university-gated academic PDF sharing platform for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}