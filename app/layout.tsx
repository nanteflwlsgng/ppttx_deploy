import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GhostPPTX — Présentations IA instantanées",
  description: "Générez des présentations PowerPoint professionnelles en quelques secondes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        {children}
      </body>
    </html>
  );
}