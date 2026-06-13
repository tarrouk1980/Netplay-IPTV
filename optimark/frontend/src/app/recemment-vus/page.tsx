"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecemmentVusPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/recemment-vus"); return; }
    api.get("/products/recently-viewed")
      .then(r => setProducts(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">🕐 Récemment vus</h1>
        <p className="text-slate-500 text-sm mb-6">{products.length} produit(s) consultés récemment.</p>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">👀</p>
            <p className="font-bold text-slate-700 mb-2">Aucun produit consulté</p>
            <p className="text-slate-400 text-sm mb-4">Parcourez notre catalogue pour découvrir des produits.</p>
            <Link href="/produits" className="text-rose-800 hover:underline font-semibold text-sm">Découvrir des produits →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => (
              <Link key={p.id} href={`/produits/${p.id}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition group"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {p.promoPrice && (
                    <span className="absolute top-2 left-2 bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{Math.round((1 - p.promoPrice / p.price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400 mb-2 truncate">{p.seller?.name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-black text-rose-800 text-sm">
                      {p.promoPrice ?? p.price} TND
                    </span>
                    {p.promoPrice && (
                      <span className="text-slate-400 text-xs line-through">{p.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
