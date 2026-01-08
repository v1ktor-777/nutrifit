import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NutriFit",
  description: "Fitness programs, nutrition tracking and progress monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col gap-6">
            <Navbar />
            <main className="flex-1 container py-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
