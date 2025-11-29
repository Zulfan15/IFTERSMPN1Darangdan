import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./force-light.css";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ServiceWorkerRegistration } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "LJK Grading System - SMPN 1 Darangdan",
  description: "Sistem Pemeriksaan LJK Otomatis dengan Computer Vision",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LJK Grading",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
