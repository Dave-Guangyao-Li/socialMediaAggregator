import "./styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Font configuration
const inter = Inter({ subsets: ["latin"] });

// Metadata for the app
export const metadata: Metadata = {
  title: "Social Media Aggregator",
  description: "A real-time social media content aggregator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
