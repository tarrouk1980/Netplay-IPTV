"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function SellerBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", discount: "10", productIds: [] as string[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/vendors/products"),
      api.get("/bundles/my"),
    ]).then(([pRes, bRes]) => {
      setProducts(pRes.data?.data || []);
      setBundles(bRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadBundles = () => api.get("/bundles/my").then(r => setBundles(r.data?.data || [])).catch(() => {});

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter(p => p !== id) : [...f.productIds, id],
    }));
  };

  const save = async () => {
    if (!form.title.trim() || form.productIds.length < 2) {
      alert("Titre requis et au moins 2 produits sélectionnés.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/bundles", { ...form, discount: parseFloat(form.discount) || 10 });
      setShowForm(false);
      setForm({ title: "", description: "", discount: "10", productIds: [] });
      await loadBundles();
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm("Supprimer ce bundle ?")) return;
    await api.delete(`/bundles/${id}`).catch(() => {});
    await loadBundles();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900">🎁 Mes offres groupées</h1>
          <button onClick={() => setShowForm(v => !v)} className="bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-rose-900 transition">
            {showForm ? "✕ Annuler" : "+ Nouveau bundle"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-900 mb-4">Créer un bundle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Pack Maison Complète" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Décrivez ce bundle..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Réduction (%)</label>
                <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} min={1} max={90} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Produits ({form.productIds.length} sélectionnés)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {products.map(p => (
                    <label key={p.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition text-sm ${form.productIds.includes(p.id) ? "border-rose-800 bg-rose-50" : "border-slate-200 hover:border-rose-300"}`}>
                      <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-rose-800" />
                      <span className="truncate">{p.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={save} disabled={saving} className="bg-rose-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition disabled:opacity-50 hover:bg-rose-900">
                {saving ? "Création..." : "✓ Créer le bundle"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div>
        ) : bundles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <p className="text-4xl mb-3">🎁</p>
            <p className="font-semibold">Aucun bundle créé</p>
            <p className="text-sm mt-1">Combinez vos produits pour proposer des offres attractives.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bundles.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-slate-900">{b.title}</h3>
                    <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2 py-0.5 rounded-full">-{b.discount}%</span>
                    {!b.isActive && <span className="bg-slate-100 text-slate-500 font-bold text-xs px-2 py-0.5 rounded-full">Inactif</span>}
                  </div>
                  <p className="text-slate-500 text-sm mb-2">{b.items?.length || 0} produits · Prix bundle : <strong className="text-rose-800">{Number(b.discountedPrice).toFixed(2)} TND</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {b.items?.map((item: any) => (
                      <span key={item.id} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{item.product?.title}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteBundle(b.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold shrink-0">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
