import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Crockery",
  description: "Beautiful crockery for every table",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
