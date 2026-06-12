"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import api from "@/lib/api";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 3);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    Promise.all(ids.map(id => api.get(`/products/${id}`).then(r => r.data?.data).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const SPECS_KEYS = ["Marque", "Catégorie", "Stock", "Vendeur", "Note"];

  const getVal = (p: any, key: string): string => {
    switch (key) {
      case "Marque": return p.brand || "—";
      case "Catégorie": return p.category || "—";
      case "Stock": return p.stock === 0 ? "Épuisé" : `${p.stock} disponible(s)`;
      case "Vendeur": return p.seller?.name || "—";
      case "Note": return p.avgRating ? `${Number(p.avgRating).toFixed(1)}/5` : "Nouveau";
      default: return "—";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-96 rounded-2xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Comparer les produits</h1>
            <p className="text-slate-500 text-sm mt-1">{products.length} produit(s) sélectionné(s)</p>
          </div>
          <Link href="/produits" className="text-rose-800 font-semibold text-sm hover:underline">← Retour aux produits</Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-slate-700 text-lg">Aucun produit à comparer</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Ajoutez des produits depuis la liste pour les comparer</p>
            <Link href="/produits" className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
              Parcourir les produits
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-3">
              <thead>
                <tr>
                  <th className="w-40 text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-3">Critère</th>
                  {products.map(p => (
                    <th key={p.id} className="min-w-[200px]">
                      <div className="bg-white rounded-2xl border border-slate-100 p-4 text-left" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div className="h-32 bg-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            : <span className="text-4xl">📦</span>}
                        </div>
                        <p className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{p.title}</p>
                        <p className="text-rose-800 font-black text-lg">{Number(p.promoPrice || p.price).toFixed(2)} TND</p>
                        {p.promoPrice && <p className="text-slate-400 text-xs line-through">{Number(p.price).toFixed(2)} TND</p>}
                        <button
                          onClick={() => { addItem({ id: p.id, title: p.title, price: p.promoPrice || p.price, seller: p.seller?.name || "", qty: 1 }); }}
                          className="mt-3 w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-2 rounded-xl text-xs transition">
                          Ajouter au panier
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPECS_KEYS.map(key => (
                  <tr key={key}>
                    <td className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-2">{key}</td>
                    {products.map(p => {
                      const val = getVal(p, key);
                      return (
                        <td key={p.id} className="bg-white rounded-xl px-4 py-3 text-sm text-slate-700 font-medium border border-slate-100 text-center">
                          {key === "Note" && p.avgRating
                            ? <span className="text-amber-500 font-black">★ {val}</span>
                            : key === "Stock" && p.stock === 0
                            ? <span className="text-rose-600 font-bold">Épuisé</span>
                            : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Custom specs */}
                {(() => {
                  const allSpecKeys = [...new Set(products.flatMap(p => p.specs ? Object.keys(p.specs) : []))];
                  return allSpecKeys.map(k => (
                    <tr key={k}>
                      <td className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-2">{k}</td>
                      {products.map(p => (
                        <td key={p.id} className="bg-white rounded-xl px-4 py-3 text-sm text-slate-700 border border-slate-100 text-center">
                          {p.specs?.[k] ?? <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ));
                })()}
                {/* Description row */}
                <tr>
                  <td className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-2">Description</td>
                  {products.map(p => (
                    <td key={p.id} className="bg-white rounded-xl px-4 py-3 text-xs text-slate-500 border border-slate-100">
                      {p.description?.slice(0, 120) || "—"}{p.description?.length > 120 ? "..." : ""}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ComparerPage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
