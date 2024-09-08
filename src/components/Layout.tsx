import { Navigation } from "@/components/Navigation";
import { Footer } from "./Footer";
import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
