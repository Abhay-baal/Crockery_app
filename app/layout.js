import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Magotra Bartan Store | Quality Crockery",
  description:
    "Quality crockery at affordable rates from Magotra Bartan Store, Jammu.",
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
