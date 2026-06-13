"use client";

import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FlashSale {
  id: string;
  productId: string;
  discount: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  product: { id: string; name: string; price: number; images: string[] };
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function VendeurFlashVentesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    discount: "",
    startAt: "",
    endAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth/connexion"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [salesRes, prodsRes] = await Promise.all([
        api.get("/flash-sales/my"),
        api.get("/vendors/products"),
      ]);
      setSales(salesRes.data?.data || salesRes.data || []);
      setProducts(prodsRes.data?.data || prodsRes.data || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/flash-sales", {
        productId: form.productId,
        discount: Number(form.discount),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setForm({ productId: "", discount: "", startAt: "", endAt: "" });
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await api.patch(`/flash-sales/${id}/toggle`);
      fetchAll();
    } catch {}
  };

  const deleteSale = async (id: string) => {
    if (!confirm("Supprimer cette vente flash ?")) return;
    try {
      await api.delete(`/flash-sales/${id}`);
      fetchAll();
    } catch {}
  };

  const fmt = (d: string) => new Date(d).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">⚡ Ventes Flash</h1>
            <p className="text-slate-500 text-sm mt-1">Créez des promotions limitées dans le temps pour booster vos ventes.</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-rose-900 transition">
            {showForm ? "Annuler" : "+ Nouvelle vente flash"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 space-y-4">
            <h2 className="font-bold text-slate-800">Nouvelle vente flash</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Produit</label>
                <select required value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Choisir un produit...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.price} TND</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Réduction (%)</label>
                <input required type="number" min="1" max="90" value={form.discount}
                  onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  placeholder="Ex: 30"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Début</label>
                <input required type="datetime-local" value={form.startAt}
                  onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fin</label>
                <input required type="datetime-local" value={form.endAt}
                  onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-rose-900 transition disabled:opacity-60">
              {saving ? "Création..." : "Créer la vente flash"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Chargement...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-4xl mb-3">⚡</p>
            <p className="font-bold text-slate-700">Aucune vente flash</p>
            <p className="text-slate-400 text-sm mt-1">Créez votre première vente flash pour attirer des acheteurs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map(sale => {
              const start = new Date(sale.startAt);
              const end = new Date(sale.endAt);
              const isLive = sale.isActive && start <= now && end >= now;
              const isPast = end < now;
              const isFuture = start > now;
              const discountedPrice = sale.product ? (sale.product.price * (1 - sale.discount / 100)).toFixed(2) : null;

              return (
                <div key={sale.id}
                  className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-5 ${
                    isLive ? "border-rose-400" : isPast ? "border-slate-100 opacity-60" : "border-slate-200"
                  }`}>
                  {sale.product?.images?.[0] && (
                    <img src={sale.product.images[0]} alt={sale.product.name}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 truncate">{sale.product?.name}</span>
                      {isLive && <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                      {isFuture && !isPast && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">À VENIR</span>}
                      {isPast && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">TERMINÉ</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-rose-700 font-black text-lg">-{sale.discount}%</span>
                      {discountedPrice && (
                        <span className="text-sm text-slate-500">
                          <span className="line-through">{sale.product.price} TND</span>
                          {" → "}
                          <span className="font-bold text-slate-800">{discountedPrice} TND</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {fmt(sale.startAt)} → {fmt(sale.endAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isPast && (
                      <button onClick={() => toggle(sale.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          sale.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}>
                        {sale.isActive ? "Actif" : "Inactif"}
                      </button>
                    )}
                    <button onClick={() => deleteSale(sale.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
