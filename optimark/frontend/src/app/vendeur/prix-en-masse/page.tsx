"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProductRow = {
  id: string;
  title: string;
  price: number;
  promoPrice: number | null;
  newPrice: string;
  newPromo: string;
  selected: boolean;
};

export default function BulkPricePage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/vendors/products")
      .then(r => {
        const products = r.data?.data || [];
        setRows(products.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          promoPrice: p.promoPrice ?? null,
          newPrice: "",
          newPromo: "",
          selected: false,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAll = (checked: boolean) => setRows(prev => prev.map(r => ({ ...r, selected: checked })));

  const save = async () => {
    const updates = rows
      .filter(r => r.selected && (r.newPrice.trim() || r.newPromo.trim()))
      .map(r => ({
        id: r.id,
        ...(r.newPrice.trim() ? { price: parseFloat(r.newPrice) } : {}),
        ...(r.newPromo.trim() !== "" ? { promoPrice: r.newPromo.trim() === "-" ? null : parseFloat(r.newPromo) } : {}),
      }))
      .filter(u => (u.price === undefined || !isNaN(u.price)) && (u.promoPrice === undefined || u.promoPrice === null || !isNaN(u.promoPrice)));

    if (updates.length === 0) return;
    setSaving(true);
    try {
      const res = await api.post("/vendors/products/bulk-price", { updates });
      setResult(res.data?.message || "Mis à jour !");
      setRows(prev => prev.map(r => {
        const upd = updates.find(u => u.id === r.id);
        if (!upd) return r;
        return {
          ...r,
          price: upd.price ?? r.price,
          promoPrice: upd.promoPrice !== undefined ? upd.promoPrice : r.promoPrice,
          newPrice: "",
          newPromo: "",
          selected: false,
        };
      }));
      setTimeout(() => setResult(null), 4000);
    } catch { } finally { setSaving(false); }
  };

  const filtered = rows.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()));
  const selectedCount = rows.filter(r => r.selected).length;
  const hasEdits = rows.some(r => r.selected && (r.newPrice.trim() || r.newPromo.trim()));

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link href="/vendeur/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-1">💲 Mise à jour des prix en masse</h1>
            <p className="text-slate-500 text-sm mt-0.5">Sélectionnez des produits et modifiez leurs prix en un clic.</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && <span className="text-sm font-semibold text-slate-600">{selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}</span>}
            <button onClick={save} disabled={saving || !hasEdits}
              className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50">
              {saving ? "Mise à jour..." : "✓ Appliquer les changements"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-4 text-green-800 text-sm font-semibold">✓ {result}</div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
            />
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
              <input type="checkbox" onChange={e => setRows(prev => prev.map(r => ({ ...r, selected: e.target.checked })))} className="accent-rose-800" />
              Tout sélectionner
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold text-xs uppercase tracking-wide">Produit</th>
                  <th className="px-4 py-3 text-right text-slate-500 font-semibold text-xs uppercase tracking-wide">Prix actuel</th>
                  <th className="px-4 py-3 text-right text-slate-500 font-semibold text-xs uppercase tracking-wide">Promo actuel</th>
                  <th className="px-4 py-3 text-right text-slate-500 font-semibold text-xs uppercase tracking-wide">Nouveau prix</th>
                  <th className="px-4 py-3 text-right text-slate-500 font-semibold text-xs uppercase tracking-wide">Nouvelle promo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className={`border-b border-slate-50 transition ${row.selected ? "bg-rose-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={row.selected} onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="accent-rose-800" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-[200px] truncate" title={row.title}>{row.title}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{row.price.toFixed(2)} TND</td>
                    <td className="px-4 py-3 text-right text-slate-400">{row.promoPrice ? `${row.promoPrice.toFixed(2)} TND` : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.newPrice}
                        onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, newPrice: e.target.value } : r))}
                        placeholder={row.price.toFixed(2)}
                        className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-rose-100"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.newPromo}
                        onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, newPromo: e.target.value } : r))}
                        placeholder={row.promoPrice ? row.promoPrice.toFixed(2) : "—"}
                        className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-rose-100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
