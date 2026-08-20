import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { DM_Sans, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "MY VET",
  description: "Find and review trusted veterinary practices.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", manrope.variable, dmSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
