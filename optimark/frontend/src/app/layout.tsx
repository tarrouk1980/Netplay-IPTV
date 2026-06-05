import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPTIMARK - La marketplace tunisienne",
  description: "Achetez et vendez des produits, services et créations artisanales tunisiennes sur OPTIMARK, la marketplace made in Tunisia.",
  keywords: ["marketplace", "tunisie", "acheter", "vendre", "produits", "services"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
