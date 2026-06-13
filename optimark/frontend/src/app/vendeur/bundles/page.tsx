"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

type Bundle = {
  id: string;
  title: string;
  description?: string;
  discount: number;
  isActive: boolean;
  items: { id: string; product: { id: string; title: string; price: number } }[];
};

const EMPTY = { title: "", description: "", discount: "", productIds: [] as string[] };

export default function SellerBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/bundles/my"), api.get("/vendors/products")])
      .then(([bRes, pRes]) => {
        setBundles(bRes.data.data || []);
        setProducts(pRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setError(""); setShowForm(true); };
  const openEdit = (b: Bundle) => {
    setEditId(b.id);
    setForm({ title: b.title, description: b.description || "", discount: String(b.discount), productIds: b.items.map(i => i.product.id) });
    setError("");
    setShowForm(true);
  };

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter(p => p !== id) : [...f.productIds, id],
    }));
  };

  const save = async () => {
    setError("");
    const discount = parseFloat(form.discount);
    if (!form.title.trim()) { setError("Titre requis"); return; }
    if (isNaN(discount) || discount <= 0 || discount > 100) { setError("Réduction invalide (0–100%)"); return; }
    if (form.productIds.length < 2) { setError("Sélectionnez au moins 2 produits"); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description, discount, productIds: form.productIds };
      if (editId) {
        const res = await api.put(`/bundles/${editId}`, payload);
        setBundles(prev => prev.map(b => b.id === editId ? res.data.data : b));
      } else {
        const res = await api.post("/bundles", payload);
        setBundles(prev => [res.data.data, ...prev]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce bundle ?")) return;
    try {
      await api.delete(`/bundles/${id}`);
      setBundles(prev => prev.filter(b => b.id !== id));
    } catch { alert("Erreur lors de la suppression"); }
  };

  const toggleActive = async (b: Bundle) => {
    try {
      const res = await api.put(`/bundles/${b.id}`, { isActive: !b.isActive });
      setBundles(prev => prev.map(x => x.id === b.id ? res.data.data : x));
    } catch { alert("Erreur"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">📦 Mes bundles</h1>
            <p className="text-slate-500 text-sm mt-1">Groupez vos produits avec une remise pour augmenter le panier moyen</p>
          </div>
          <button onClick={openCreate} className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-rose-900 transition text-sm">
            + Nouveau bundle
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-8" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <h2 className="text-lg font-black text-slate-900 mb-6">{editId ? "Modifier le bundle" : "Nouveau bundle"}</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Titre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Pack Cuisine" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Réduction (%) *</label>
                <input value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} type="number" min="1" max="100" placeholder="Ex: 15" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Description optionnelle" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 block mb-2">Produits * ({form.productIds.length} sélectionnés)</label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {products.map(p => {
                  const sel = form.productIds.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition ${sel ? "border-rose-800 bg-rose-50" : "border-slate-200 hover:border-rose-300"}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition ${sel ? "bg-rose-800 border-rose-800" : "border-slate-300"}`}>
                        {sel && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.price} TND</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-rose-900 transition text-sm disabled:opacity-50">
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-slate-500 font-semibold text-sm px-4 hover:text-slate-700">Annuler</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Chargement...</div>
        ) : bundles.length === 0 && !showForm ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-bold text-slate-700 text-lg">Aucun bundle créé</p>
            <p className="text-slate-400 text-sm mt-1">Créez votre premier bundle pour attirer les clients.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bundles.map(b => (
              <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{b.title}</h3>
                    {b.description && <p className="text-sm text-slate-500 mt-0.5">{b.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">-{b.discount}%</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${b.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        {b.isActive ? "Actif" : "Inactif"}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">{b.items.length} produits</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button onClick={() => openEdit(b)} className="text-xs font-bold text-rose-800 hover:underline px-3 py-1.5 border border-rose-200 rounded-lg">Modifier</button>
                    <button onClick={() => toggleActive(b)} className={`text-xs font-bold px-3 py-1.5 border rounded-lg ${b.isActive ? "text-slate-500 border-slate-200 hover:border-slate-400" : "text-green-700 border-green-200 hover:border-green-400"}`}>
                      {b.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => remove(b.id)} className="text-xs font-bold text-red-600 hover:underline px-3 py-1.5 border border-red-200 rounded-lg">Supprimer</button>
                  </div>
                </div>
                <div className="border-t border-slate-50 pt-3 flex flex-wrap gap-2">
                  {b.items.map(i => (
                    <span key={i.id} className="text-xs px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                      {i.product.title} — {i.product.price} TND
                    </span>
                  ))}
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
