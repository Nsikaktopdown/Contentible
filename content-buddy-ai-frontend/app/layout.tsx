import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const lexendDeca = Lexend_Deca({ 
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});

export const metadata: Metadata = {
  title: "Content Buddy AI",
  description: "Your AI-powered content creation assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
} 