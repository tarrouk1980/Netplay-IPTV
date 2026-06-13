"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function PublicWishlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/wishlists/public/${id}`)
      .then(r => setList(r.data?.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="skeleton h-20 rounded-2xl mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}
        </div>
      </main><Footer />
    </div>
  );

  if (notFound || !list) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-5xl">📋</p>
        <p className="font-bold text-slate-700 text-xl">Liste introuvable ou privée</p>
        <Link href="/" className="text-rose-800 hover:underline text-sm">← Retour à l'accueil</Link>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <h1 className="text-2xl font-black text-slate-900">{list.name}</h1>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Publique</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{list.items?.length || 0} produit{list.items?.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={share} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition">
            {copied ? "✓ Lien copié !" : "🔗 Partager cette liste"}
          </button>
        </div>

        {list.items?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500">Cette liste est vide pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {list.items.map((item: any) => {
              const p = item.product;
              return (
                <ProductCard key={item.id} id={p.id} title={p.title}
                  price={p.promoPrice || p.price}
                  originalPrice={p.promoPrice ? p.price : undefined}
                  seller={p.seller?.name || "Vendeur"}
                  rating={p.averageRating || 0}
                  isVerified={p.seller?.isVerified}
                  category={p.category}
                  image={p.images?.[0]}
                  isBestSeller={p.isBestSeller}
                  stock={p.stock}
                  stockAlert={p.stockAlert}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
