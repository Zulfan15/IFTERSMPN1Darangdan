import type { Metadata } from "next";
import "./globals.css";
import "./force-light.css";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
