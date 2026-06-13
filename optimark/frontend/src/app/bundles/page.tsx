"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    api.get("/bundles").then(r => setBundles(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addBundle = (bundle: any) => {
    bundle.items.forEach((item: any) => {
      addItem({ id: item.product.id, title: item.product.title, price: item.product.promoPrice ?? item.product.price, seller: bundle.seller?.name || "Vendeur", image: item.product.images?.[0] });
    });
    alert(`✓ ${bundle.items.length} produits ajoutés au panier !`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">🎁 Offres groupées</h1>
          <p className="text-slate-500 text-sm mt-1">Achetez plusieurs produits ensemble et économisez</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}</div>
        ) : bundles.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center text-slate-400 border border-slate-100">
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-semibold text-lg">Aucune offre groupée disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map(bundle => (
              <div key={bundle.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {/* Discount badge */}
                <div className="bg-gradient-to-r from-rose-800 to-rose-900 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white text-lg">{bundle.title}</h3>
                    {bundle.seller && <p className="text-rose-200 text-xs mt-0.5">par {bundle.seller.name}</p>}
                  </div>
                  <div className="bg-white text-rose-800 font-black text-2xl px-3 py-2 rounded-xl">
                    -{bundle.discount}%
                  </div>
                </div>

                <div className="p-5">
                  {bundle.description && <p className="text-slate-500 text-sm mb-4">{bundle.description}</p>}

                  {/* Products list */}
                  <div className="space-y-2 mb-4">
                    {bundle.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" /> : <span>📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/produits/${item.product.id}`} className="text-sm font-semibold text-slate-800 hover:text-rose-800 truncate block">{item.product.title}</Link>
                          <p className="text-xs text-slate-400">{Number(item.product.promoPrice ?? item.product.price).toFixed(2)} TND</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Prix total</span>
                      <span className="text-slate-400 line-through">{Number(bundle.totalPrice).toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900">Prix bundle</span>
                      <span className="text-rose-800 font-black text-xl">{Number(bundle.discountedPrice).toFixed(2)} TND</span>
                    </div>
                    <p className="text-green-600 text-xs font-semibold mt-1 text-right">Économie : {Number(bundle.savings).toFixed(2)} TND</p>
                  </div>

                  <button
                    onClick={() => addBundle(bundle)}
                    className="w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-3 rounded-xl transition"
                  >
                    🛒 Ajouter le bundle au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
