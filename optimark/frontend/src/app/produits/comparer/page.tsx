"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

function ComparerContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    Promise.all(ids.map(id => api.get(`/products/${id}`).then(r => r.data?.data).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, []);

  const ROWS = [
    { label: "Prix", key: (p: any) => `${Number(p.promoPrice || p.price).toFixed(2)} TND`, highlight: (vals: string[]) => {
      const nums = vals.map(v => parseFloat(v));
      const min = Math.min(...nums);
      return vals.map(v => parseFloat(v) === min);
    }},
    { label: "Prix original", key: (p: any) => p.promoPrice ? `${Number(p.price).toFixed(2)} TND` : "—", highlight: () => [] },
    { label: "Catégorie", key: (p: any) => p.category, highlight: () => [] },
    { label: "Vendeur", key: (p: any) => p.seller?.name || "—", highlight: () => [] },
    { label: "Vendeur vérifié", key: (p: any) => p.seller?.isVerified ? "✓ Oui" : "Non", highlight: (vals: string[]) => vals.map(v => v === "✓ Oui") },
    { label: "Stock", key: (p: any) => p.stock > 0 ? `${p.stock} disponibles` : "Épuisé", highlight: (vals: string[]) => vals.map(v => v !== "Épuisé") },
    { label: "Best Seller", key: (p: any) => p.isBestSeller ? "🏆 Oui" : "Non", highlight: (vals: string[]) => vals.map(v => v.includes("Oui")) },
    { label: "Nouveau", key: (p: any) => p.isNewArrival ? "🆕 Oui" : "Non", highlight: () => [] },
    { label: "Marque", key: (p: any) => p.brand || "—", highlight: () => [] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/produits" className="text-slate-400 hover:text-slate-600">←</Link>
          <h1 className="text-2xl font-black text-slate-900">Comparaison de produits</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl h-64"/>)}
          </div>
        ) : products.length < 2 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">⚖️</p>
            <p className="text-xl font-bold text-slate-700 mb-2">Sélectionnez au moins 2 produits</p>
            <Link href="/produits" className="text-rose-800 hover:underline font-semibold">← Retour aux produits</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
            {/* Product headers */}
            <div className={`grid border-b border-slate-100`} style={{gridTemplateColumns:`200px repeat(${products.length}, 1fr)`}}>
              <div className="p-4 bg-slate-50 border-r border-slate-100" />
              {products.map(p => (
                <div key={p.id} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                  <div className="w-24 h-24 mx-auto bg-slate-100 rounded-xl overflow-hidden mb-3">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover"/>
                      : <span className="text-4xl flex items-center justify-center h-full">📦</span>}
                  </div>
                  <Link href={`/produits/${p.id}`} className="font-bold text-slate-900 text-sm hover:text-rose-800 transition line-clamp-2 block mb-2">
                    {p.title}
                  </Link>
                  <p className="text-rose-800 font-black text-lg">{Number(p.promoPrice || p.price).toFixed(2)} TND</p>
                  {p.stock > 0 && (
                    <button
                      onClick={() => addItem({ id: p.id, title: p.title, price: p.promoPrice || p.price, seller: p.seller?.name || "Vendeur", image: p.images?.[0] })}
                      className="mt-2 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition w-full">
                      Ajouter au panier
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            {ROWS.map(row => {
              const vals = products.map(p => row.key(p));
              const highlights = row.highlight(vals);
              return (
                <div key={row.label} className={`grid border-b border-slate-50 last:border-b-0`} style={{gridTemplateColumns:`200px repeat(${products.length}, 1fr)`}}>
                  <div className="px-4 py-3 bg-slate-50 border-r border-slate-100 text-sm font-semibold text-slate-600">{row.label}</div>
                  {vals.map((val, i) => (
                    <div key={i} className={`px-4 py-3 text-sm text-center border-r border-slate-50 last:border-r-0 ${highlights[i] ? "bg-green-50 text-green-700 font-bold" : "text-slate-700"}`}>
                      {val}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Description row */}
            <div className={`grid border-t border-slate-100`} style={{gridTemplateColumns:`200px repeat(${products.length}, 1fr)`}}>
              <div className="px-4 py-3 bg-slate-50 border-r border-slate-100 text-sm font-semibold text-slate-600">Description</div>
              {products.map(p => (
                <div key={p.id} className="px-4 py-3 text-xs text-slate-500 border-r border-slate-50 last:border-r-0 line-clamp-4">
                  {p.description || "—"}
                </div>
              ))}
            </div>

            {/* Specs rows — union of all spec keys */}
            {(() => {
              const allKeys = Array.from(new Set(products.flatMap(p => p.specs && typeof p.specs === 'object' ? Object.keys(p.specs) : [])));
              if (!allKeys.length) return null;
              return (
                <>
                  <div className={`grid bg-slate-900 text-white`} style={{gridTemplateColumns:`200px repeat(${products.length}, 1fr)`}}>
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide col-span-full border-t border-slate-700">Fiche technique</div>
                  </div>
                  {allKeys.map(key => (
                    <div key={key} className={`grid border-b border-slate-50`} style={{gridTemplateColumns:`200px repeat(${products.length}, 1fr)`}}>
                      <div className="px-4 py-3 bg-slate-50 border-r border-slate-100 text-sm font-semibold text-slate-600">{key}</div>
                      {products.map(p => (
                        <div key={p.id} className="px-4 py-3 text-sm text-slate-700 text-center border-r border-slate-50 last:border-r-0">
                          {(p.specs as any)?.[key] || "—"}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ComparerPage() {
  return <Suspense><ComparerContent /></Suspense>;
}
