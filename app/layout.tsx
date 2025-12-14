import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Waypoint - Event Planning AI Canvas",
  description: "AI-powered event planning canvas with React Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Only wrap with ClerkProvider if key is available
  const content = (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<div className="border-b border-border h-[73px]" />}>
          <Header />
        </Suspense>
        {children}
      </body>
    </html>
  );
  
  if (!clerkKey) {
    // During build or if key is missing, render without Clerk
    return content;
  }
  
  return (
    <ClerkProvider publishableKey={clerkKey}>
      {content}
    </ClerkProvider>
  );
}
