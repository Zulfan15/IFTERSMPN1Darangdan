import type { Metadata } from "next";
import "./globals.css";
import "./force-light.css";

export const metadata: Metadata = {
  title: "LJK Grading System - SMPN 1 Darangdan",
  description: "Sistem Pemeriksaan LJK Otomatis dengan Computer Vision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <head>
        <style>{`
          /* Force light mode */
          html, body {
            color-scheme: light !important;
            background: #f0f4ff !important;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
