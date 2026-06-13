"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SellerCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", cover: "" });
  const [saving, setSaving] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/collections"),
      api.get("/vendors/products"),
    ]).then(([cRes, pRes]) => {
      setCollections(cRes.data?.data || []);
      setProducts(pRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post("/collections", form);
      setCollections(prev => [res.data.data, ...prev]);
      setForm({ name: "", description: "", cover: "" });
      setShowForm(false);
    } catch { } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette collection ?")) return;
    await api.delete(`/collections/${id}`).catch(() => {});
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const toggleProduct = async (collectionId: string, productId: string, inCollection: boolean) => {
    if (inCollection) {
      await api.delete(`/collections/${collectionId}/products/${productId}`).catch(() => {});
    } else {
      await api.post(`/collections/${collectionId}/products`, { productId }).catch(() => {});
    }
    const res = await api.get("/collections").catch(() => null);
    if (res) setCollections(res.data?.data || []);
  };

  const togglePublic = async (col: any) => {
    await api.patch(`/collections/${col.id}`, { isPublic: !col.isPublic }).catch(() => {});
    setCollections(prev => prev.map(c => c.id === col.id ? { ...c, isPublic: !col.isPublic } : c));
  };

  const managing = managingId ? collections.find(c => c.id === managingId) : null;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/vendeur/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
            </div>
            <h1 className="text-2xl font-black text-slate-900">🗂️ Mes collections</h1>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
            + Nouvelle collection
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 className="font-black text-slate-800 mb-4">Créer une collection</h2>
            <div className="space-y-3 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Nom *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Collection Été 2026" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez votre collection..." rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Image de couverture (URL)</label>
                <input value={form.cover} onChange={e => setForm(f => ({ ...f, cover: e.target.value }))} placeholder="https://..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={create} disabled={saving || !form.name.trim()} className="bg-rose-800 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50">
                  {saving ? "Création..." : "Créer"}
                </button>
                <button onClick={() => setShowForm(false)} className="text-slate-500 text-sm hover:underline">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {collections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="font-bold text-slate-700 mb-1">Aucune collection</p>
            <p className="text-slate-400 text-sm">Créez votre première collection pour regrouper vos produits par thème.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map(col => (
              <div key={col.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between p-5 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    {col.cover && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={col.cover} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-slate-900">{col.name}</h2>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.isPublic ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                          {col.isPublic ? "Publique" : "Privée"}
                        </span>
                      </div>
                      {col.description && <p className="text-slate-500 text-xs mt-0.5">{col.description}</p>}
                      <p className="text-slate-400 text-xs mt-1">{col.items?.length || 0} produit(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={() => togglePublic(col)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
                      {col.isPublic ? "Rendre privée" : "Publier"}
                    </button>
                    <button onClick={() => setManagingId(managingId === col.id ? null : col.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition">
                      {managingId === col.id ? "Fermer" : "Gérer produits"}
                    </button>
                    <button onClick={() => remove(col.id)} className="text-xs text-slate-400 hover:text-red-500 transition px-2">✕</button>
                  </div>
                </div>

                {col.items?.length > 0 && (
                  <div className="flex gap-3 px-5 py-3 overflow-x-auto">
                    {col.items.map((item: any) => (
                      <div key={item.id} className="shrink-0 text-center w-20">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden mb-1">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight truncate">{item.product.title}</p>
                      </div>
                    ))}
                  </div>
                )}

                {managingId === col.id && (
                  <div className="border-t border-slate-100 p-5">
                    <p className="text-sm font-bold text-slate-700 mb-3">Sélectionner les produits :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {products.map(p => {
                        const inCol = col.items?.some((item: any) => item.productId === p.id);
                        return (
                          <button key={p.id} onClick={() => toggleProduct(col.id, p.id, inCol)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition ${inCol ? "border-rose-200 bg-rose-50 text-rose-800" : "border-slate-200 hover:border-rose-200 text-slate-700"}`}>
                            <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-base flex items-center justify-center h-full">📦</span>}
                            </div>
                            <span className="font-medium truncate flex-1">{p.title}</span>
                            {inCol && <span className="shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
