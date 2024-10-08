import "./globals.css";
import React from "react";
import { Inter } from "next/font/google";
import { Layout } from "@/components/Layout";
import { Metadata } from "next";
import BaiDuAnalytics from "@/app/BaiDuAnalytics";
import GoogleAnalytics from "@/app/GoogleAnalytics";
import { NextAuthProvider } from "@/app/providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GitBase",
    template: "%s | GitBase",
  },
  description:
    "Open source dynamic website without database, built with Next.js and GitHub API",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthProvider>
            <Layout>{children}</Layout>
          </NextAuthProvider>

          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>

        {process.env.NODE_ENV === "development" ? (
          <></>
        ) : (
          <>
            <GoogleAnalytics />
            <BaiDuAnalytics />
          </>
        )}
      </body>
    </html>
  );
}
