import type { Metadata } from "next";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/components.css";
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
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
