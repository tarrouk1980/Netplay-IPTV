"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CATEGORIES: Record<string, string> = {
  ELECTRONIQUE: "Électronique", MODE: "Mode", MAISON: "Maison", BEAUTE: "Beauté",
  SPORT: "Sport", ALIMENTATION: "Alimentation", JOUETS: "Jouets", LIVRES: "Livres", AUTRE: "Autre",
};

export default function CataloguePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [showPrices, setShowPrices] = useState(true);
  const [cols, setCols] = useState<3 | 4>(4);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get("/vendors/products"),
      api.get("/vendors/store"),
    ]).then(([pRes, sRes]) => {
      setProducts(pRes.data?.data || []);
      setStore(sRes.data?.data || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = selectedCat === "all" ? products : products.filter(p => p.category === selectedCat);

  const print = () => window.print();

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-slate-400 text-sm">Chargement du catalogue...</p>
    </div>
  );

  return (
    <>
      {/* Toolbar (hidden when printing) */}
      <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center gap-4 flex-wrap">
        <Link href="/vendeur/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-slate-500">|</span>
        <h1 className="font-bold text-sm">🗂️ Catalogue produits</h1>
        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
            className="bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700">
            <option value="all">Toutes catégories</option>
            {categories.filter(c => c !== "all").map(c => <option key={c} value={c}>{CATEGORIES[c] || c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={showPrices} onChange={e => setShowPrices(e.target.checked)} className="accent-rose-500" />
            Afficher les prix
          </label>
          <div className="flex gap-1">
            <button onClick={() => setCols(3)} className={`text-xs px-2 py-1 rounded ${cols === 3 ? "bg-rose-700" : "bg-slate-700"}`}>3 col</button>
            <button onClick={() => setCols(4)} className={`text-xs px-2 py-1 rounded ${cols === 4 ? "bg-rose-700" : "bg-slate-700"}`}>4 col</button>
          </div>
          <button onClick={print} className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-5 py-1.5 rounded-lg text-sm transition">
            🖨️ Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Catalogue (printable) */}
      <div ref={printRef} className="bg-white min-h-screen p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b-2 border-slate-900">
          <div className="w-16 h-16 bg-rose-800 rounded-xl flex items-center justify-center text-white text-2xl font-black shrink-0">
            {store?.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover rounded-xl" /> : store?.name?.charAt(0) || "B"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{store?.name || "Ma Boutique"}</h1>
            <p className="text-slate-500 text-sm">{store?.description || ""}</p>
            <div className="flex gap-4 mt-1 text-xs text-slate-400 flex-wrap">
              {store?.phone && <span>📞 {store.phone}</span>}
              {store?.address && <span>📍 {store.address}</span>}
              <span>📦 {filtered.length} produit{filtered.length !== 1 ? "s" : ""}</span>
              <span>Catalogue du {new Date().toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {filtered.map(p => (
            <div key={p.id} className="border border-slate-100 rounded-xl overflow-hidden break-inside-avoid">
              <div className="aspect-square bg-slate-50 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-800 text-sm leading-tight">{p.title}</p>
                {p.brand && <p className="text-slate-400 text-xs mt-0.5">{p.brand}</p>}
                {showPrices && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-black text-rose-800">{(p.promoPrice || p.price).toFixed(2)} TND</span>
                    {p.promoPrice && <span className="text-slate-400 text-xs line-through">{p.price.toFixed(2)}</span>}
                  </div>
                )}
                {p.stock <= (p.stockAlert || 5) && p.stock > 0 && (
                  <p className="text-orange-500 text-[10px] font-semibold mt-1">⚠️ Stock limité ({p.stock})</p>
                )}
                {p.stock === 0 && <p className="text-red-500 text-[10px] font-semibold mt-1">Épuisé</p>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            <p>Aucun produit dans cette catégorie</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Catalogue généré via OPTIMARK — optimark.tn</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </>
  );
}
