"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function InventairePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, { price: string; stock: string; promoPrice: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get("/vendors/products")
      .then(r => {
        const data = r.data?.data || [];
        setProducts(data);
        const initial: typeof edits = {};
        data.forEach((p: any) => {
          initial[p.id] = {
            price: String(p.price),
            stock: String(p.stock ?? 0),
            promoPrice: p.promoPrice != null ? String(p.promoPrice) : "",
          };
        });
        setEdits(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setField = (id: string, field: string, value: string) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    setSaved(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const saveProduct = async (p: any) => {
    const e = edits[p.id];
    setSaving(p.id);
    try {
      await api.patch(`/products/${p.id}`, {
        price: parseFloat(e.price) || p.price,
        stock: parseInt(e.stock) || 0,
        promoPrice: e.promoPrice ? parseFloat(e.promoPrice) : null,
      });
      setSaved(prev => new Set([...prev, p.id]));
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(null);
    }
  };

  const saveAll = async () => {
    for (const p of products) {
      await saveProduct(p);
    }
  };

  const isDirty = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p) return false;
    const e = edits[id];
    return (
      parseFloat(e?.price) !== p.price ||
      parseInt(e?.stock) !== (p.stock ?? 0) ||
      (e?.promoPrice ? parseFloat(e.promoPrice) : null) !== (p.promoPrice ?? null)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">📦 Gestion inventaire</h1>
            <p className="text-slate-500 text-sm mt-0.5">Modifiez les prix et stocks en masse</p>
          </div>
          <div className="flex gap-2">
            <button onClick={async () => {
              const res = await api.get('/vendors/products/export-csv', { responseType: 'blob' });
              const url = URL.createObjectURL(new Blob([res.data]));
              const a = document.createElement('a'); a.href = url; a.download = 'produits.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="border border-slate-300 text-slate-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition">
              ⬇ Exporter CSV
            </button>
            <button onClick={saveAll} className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
              ✓ Tout sauvegarder
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">Aucun produit</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Produit</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-32">Prix (TND)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-32">Promo (TND)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-24">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const e = edits[p.id] || { price: "", stock: "", promoPrice: "" };
                  const dirty = isDirty(p.id);
                  const isSaving = saving === p.id;
                  const isSaved = saved.has(p.id);
                  const lowStock = (parseInt(e.stock) || 0) <= (p.stockAlert || 5) && (parseInt(e.stock) || 0) > 0;
                  const outOfStock = (parseInt(e.stock) || 0) === 0;
                  return (
                    <tr key={p.id} className={`border-b border-slate-50 ${dirty ? "bg-rose-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 truncate max-w-xs">{p.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {outOfStock && <span className="text-red-600 text-xs font-bold">⚠ Épuisé</span>}
                          {lowStock && !outOfStock && <span className="text-orange-600 text-xs font-bold">⚠ Stock faible</span>}
                          {p.category && <span className="text-xs text-slate-400">{p.category}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={e.price} onChange={ev => setField(p.id, "price", ev.target.value)} step="0.01" min="0"
                          className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={e.promoPrice} onChange={ev => setField(p.id, "promoPrice", ev.target.value)} step="0.01" min="0"
                          placeholder="—"
                          className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={e.stock} onChange={ev => setField(p.id, "stock", ev.target.value)} min="0"
                          className={`w-full text-right border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-100 ${outOfStock ? "border-red-300 bg-red-50" : lowStock ? "border-orange-300 bg-orange-50" : "border-slate-200"}`} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSaved && !dirty ? (
                          <span className="text-green-600 text-sm font-bold">✓</span>
                        ) : (
                          <button onClick={() => saveProduct(p)} disabled={isSaving || !dirty}
                            className="bg-rose-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition hover:bg-rose-900 disabled:opacity-40">
                            {isSaving ? "..." : "Enregistrer"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
