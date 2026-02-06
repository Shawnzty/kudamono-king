import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kudamono King | 果物キング",
  description: "Fresh fruit, directly from producers. 新鮮な果物を、生産者から直接。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
