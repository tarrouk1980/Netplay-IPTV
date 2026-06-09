"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import { use, useEffect, useState } from "react";

export default function BoutiquePage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vendors/store/public/${sellerId}`)
      .then(res => setData(res.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <div className="skeleton rounded-2xl h-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-60" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const store = data?.store;
  const products = data?.products || [];
  const sellerName = store?.seller?.name || store?.name || "Boutique";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Store header */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden mb-8" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div className="h-40 bg-gradient-to-r from-rose-100 to-rose-50 relative overflow-hidden">
            {store?.cover && <img src={store.cover} alt="cover" className="w-full h-full object-cover" />}
          </div>
          <div className="px-6 pb-6 -mt-10 flex items-end gap-5">
            <div className="w-20 h-20 rounded-xl border-4 border-white bg-rose-800 flex items-center justify-center text-white text-3xl font-black shadow overflow-hidden shrink-0">
              {store?.logo ? <img src={store.logo} alt="logo" className="w-full h-full object-cover" /> : sellerName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="pt-10">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{store?.name || sellerName}</h1>
                {store?.seller?.isVerified && (
                  <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">✓ Vérifié</span>
                )}
              </div>
              {store?.description && <p className="text-slate-500 text-sm mt-1">{store.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                {store?.address && <span>📍 {store.address}</span>}
                {store?.phone && <span>📞 {store.phone}</span>}
                <span>📦 {products.length} produit{products.length > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-xl font-black text-slate-900 mb-4">Produits de la boutique</h2>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-4xl block mb-3">📦</span>
            <p className="text-slate-500">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.promoPrice || p.price}
                originalPrice={p.promoPrice ? p.price : undefined}
                seller={sellerName}
                rating={0}
                isVerified={store?.seller?.isVerified}
                category={p.category}
                image={p.images?.[0]}
                isBestSeller={p.isBestSeller}
                isNewArrival={p.isNewArrival}
                stock={p.stock}
                stockAlert={p.stockAlert}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
