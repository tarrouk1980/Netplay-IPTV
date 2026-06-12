"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", type: "PERCENT", minAmount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) { router.push("/"); return; }
    load();
  }, [user, authLoading]);

  const load = () => {
    setLoading(true);
    api.get("/coupons/my").then(r => setCoupons(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/coupons", {
        code: form.code,
        discount: parseFloat(form.discount),
        type: form.type,
        minAmount: form.minAmount ? parseFloat(form.minAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setForm({ code: "", discount: "", type: "PERCENT", minAmount: "", maxUses: "", expiresAt: "" });
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    await api.patch(`/coupons/${id}/toggle`).catch(() => {});
    load();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Supprimer ce code promo ?")) return;
    await api.delete(`/coupons/${id}`).catch(() => {});
    load();
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="skeleton h-10 w-48 rounded-xl mb-6" />
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Codes promo</h1>
            <p className="text-slate-500 text-sm mt-1">Créez des réductions pour vos clients</p>
          </div>
          <button onClick={() => setShowForm(f => !f)}
            className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
            {showForm ? "Annuler" : "+ Nouveau code"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 className="font-bold text-slate-800 mb-4">Créer un code promo</h2>
            {error && <p className="text-rose-700 text-sm bg-rose-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
            <form onSubmit={create} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required
                  placeholder="EX: PROMO20" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 bg-white">
                  <option value="PERCENT">Pourcentage (%)</option>
                  <option value="FIXED">Montant fixe (TND)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Réduction * {form.type === "PERCENT" ? "(%)" : "(TND)"}</label>
                <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} required min="0"
                  placeholder={form.type === "PERCENT" ? "20" : "10"} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Montant min. (TND)</label>
                <input type="number" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} min="0"
                  placeholder="Optionnel" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Utilisations max.</label>
                <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} min="1"
                  placeholder="Illimité" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Expiration</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>
              <div className="col-span-2">
                <button type="submit" disabled={saving}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-8 py-3 rounded-xl text-sm transition disabled:opacity-50">
                  {saving ? "Création..." : "Créer le code"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {coupons.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">🏷️</p>
            <p className="font-semibold">Aucun code promo</p>
            <p className="text-sm mt-1">Créez votre premier code pour fidéliser vos clients</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-rose-50 border border-dashed border-rose-300 rounded-xl px-4 py-2">
                    <p className="font-black text-rose-800 text-lg tracking-widest">{coupon.code}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {coupon.type === "PERCENT" ? `${coupon.discount}% de réduction` : `${coupon.discount} TND de réduction`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {coupon.minAmount ? `Min. ${coupon.minAmount} TND · ` : ""}
                      {coupon.maxUses ? `${coupon.usedCount}/${coupon.maxUses} utilisations` : `${coupon.usedCount} utilisations`}
                      {coupon.expiresAt ? ` · Expire le ${new Date(coupon.expiresAt).toLocaleDateString("fr-TN")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div onClick={() => toggle(coupon.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${coupon.isActive ? "bg-rose-800" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${coupon.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-slate-400 hover:text-rose-700 text-sm transition p-1">🗑</button>
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
