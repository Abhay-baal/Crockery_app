import "./globals.css";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import RequireAuth from "@/components/RequireAuth";

export const metadata = {
  title: "Crockery",
  description: "Beautiful crockery for every table",
  applicationName: "Crockery",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crockery",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FCFCFA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-stone-50">
              <p className="text-sm text-stone-500">Checking account...</p>
            </main>
          }
        >
          <RequireAuth>
            <CartProvider>{children}</CartProvider>
          </RequireAuth>
        </Suspense>
      </body>
    </html>
  );
}
