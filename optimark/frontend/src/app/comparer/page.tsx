"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const MAX = 3;
const STORAGE_KEY = "compare_ids";

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function addToCompare(id: string) {
  const ids = getCompareIds();
  if (ids.includes(id)) return;
  const next = [...ids, id].slice(-MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("compare-update"));
}

export function removeFromCompare(id: string) {
  const ids = getCompareIds().filter(x => x !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("compare-update"));
}

export default function ComparerPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const update = () => setIds(getCompareIds());
    update();
    window.addEventListener("compare-update", update);
    return () => window.removeEventListener("compare-update", update);
  }, []);

  useEffect(() => {
    const missing = ids.filter(id => !products[id]);
    if (missing.length === 0) return;
    setLoading(true);
    Promise.all(missing.map(id => api.get(`/products/${id}`).catch(() => null)))
      .then(res => {
        const updates: Record<string, any> = {};
        res.forEach((r, i) => { if (r?.data?.data) updates[missing[i]] = r.data.data; });
        setProducts(prev => ({ ...prev, ...updates }));
      })
      .finally(() => setLoading(false));
  }, [ids]);

  const listed = ids.map(id => products[id]).filter(Boolean);
  const specKeys = Array.from(new Set(listed.flatMap(p => Object.keys(p.specs || {}))));

  const rows = [
    { label: "Prix", render: (p: any) => <span className="font-black text-rose-800">{Number(p.promoPrice || p.price).toFixed(2)} TND</span> },
    { label: "Marque", render: (p: any) => p.brand || "—" },
    { label: "Catégorie", render: (p: any) => p.category || "—" },
    { label: "Stock", render: (p: any) => p.stock > 0 ? <span className="text-green-600 font-semibold">{p.stock} en stock</span> : <span className="text-red-500 font-semibold">Épuisé</span> },
    { label: "Vendeur", render: (p: any) => p.seller?.name || "—" },
    { label: "Vérifié", render: (p: any) => p.seller?.isVerified ? <span className="text-green-600 font-bold">✓ Oui</span> : <span className="text-slate-400">Non</span> },
    ...specKeys.map(key => ({
      label: key,
      render: (p: any) => p.specs?.[key] != null ? String(p.specs[key]) : "—",
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">⚖️ Comparateur de produits</h1>
            <p className="text-slate-500 text-sm">Comparez jusqu&apos;à {MAX} produits côte à côte</p>
          </div>
          {ids.length > 0 && (
            <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setIds([]); window.dispatchEvent(new Event("compare-update")); }}
              className="text-sm text-slate-500 hover:text-rose-600 font-semibold transition">
              Tout effacer
            </button>
          )}
        </div>

        {ids.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <p className="text-5xl mb-3">⚖️</p>
            <p className="text-slate-500 font-semibold mb-2">Aucun produit à comparer</p>
            <p className="text-slate-400 text-sm mb-4">Sur une fiche produit, cliquez sur &ldquo;⚖️ Comparer&rdquo; pour l&apos;ajouter ici.</p>
            <Link href="/produits" className="text-rose-800 font-bold hover:underline">Parcourir les produits →</Link>
          </div>
        ) : loading ? (
          <div className="animate-pulse h-48 bg-white rounded-2xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate" style={{ borderSpacing: 0 }}>
              <thead>
                <tr>
                  <td className="w-32 bg-slate-50 rounded-tl-2xl border-b border-slate-100 px-4 py-3" />
                  {listed.map(p => (
                    <td key={p.id} className="bg-white border-b border-l border-slate-100 px-4 py-4 align-top" style={{ minWidth: 200 }}>
                      <div className="relative">
                        <button onClick={() => removeFromCompare(p.id)} className="absolute -top-1 -right-1 text-slate-400 hover:text-rose-600 text-xs font-bold">✕</button>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-32 object-cover rounded-xl mb-3" />}
                        <Link href={`/produits/${p.id}`} className="font-bold text-slate-800 hover:text-rose-800 block leading-snug mb-2">{p.title}</Link>
                        <button
                          onClick={() => addItem({ id: p.id, title: p.title, price: p.price, seller: p.seller?.name || "", image: p.images?.[0] })}
                          disabled={p.stock === 0}
                          className="w-full mt-2 bg-rose-800 text-white font-bold py-2 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-40"
                        >
                          {p.stock === 0 ? "Épuisé" : "🛒 Ajouter au panier"}
                        </button>
                      </div>
                    </td>
                  ))}
                  {listed.length < MAX && (
                    <td className="bg-slate-50 border-b border-l border-slate-100 px-4 py-4 align-top rounded-tr-2xl" style={{ minWidth: 160 }}>
                      <Link href="/produits" className="flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-rose-800 transition h-40">
                        <span className="text-3xl">+</span>
                        <span className="text-xs font-semibold text-center">Ajouter un produit</span>
                      </Link>
                    </td>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">{row.label}</td>
                    {listed.map(p => (
                      <td key={p.id} className="px-4 py-3 text-sm text-slate-700 border-b border-l border-slate-100">
                        {row.render(p)}
                      </td>
                    ))}
                    {listed.length < MAX && <td className="border-b border-l border-slate-100" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
