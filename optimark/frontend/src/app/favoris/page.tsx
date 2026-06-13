"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FavorisPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/favoris"); return; }

    api.get("/favorites")
      .then(res => setProducts(res.data?.data || res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Mes favoris</h1>
        <p className="text-slate-500 text-sm mb-8">Les produits que vous avez sauvegardés</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-60" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">♡</span>
            <p className="text-xl font-bold text-slate-700 mb-1">Aucun favori pour le moment</p>
            <p className="text-slate-400 text-sm mb-5">Ajoutez des produits à vos favoris depuis leurs pages.</p>
            <Link href="/produits" className="inline-block bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                seller={p.seller?.name || "Vendeur"}
                rating={0}
                isVerified={p.seller?.isVerified}
                category={p.category}
                image={p.images?.[0]}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
