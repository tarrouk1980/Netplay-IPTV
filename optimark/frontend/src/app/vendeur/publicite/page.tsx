"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AD_TYPES = [
  { key: "PRODUCT_BOOST", label: "Boost Produit", icon: "🚀", desc: "Apparaissez en tête de recherche", rate: "0.05 TND/clic", color: "border-rose-200 bg-rose-50" },
  { key: "HOMEPAGE_BANNER", label: "Bannière Accueil", icon: "🖼️", desc: "Visible sur la page d'accueil", rate: "2.50 TND/jour", color: "border-amber-200 bg-amber-50" },
  { key: "CATEGORY_SPOTLIGHT", label: "Vedette Catégorie", icon: "⭐", desc: "Mis en avant dans votre catégorie", rate: "1.00 TND/jour", color: "border-purple-200 bg-purple-50" },
  { key: "SEARCH_PRIORITY", label: "Priorité Recherche", icon: "🔍", desc: "Top résultats de recherche", rate: "0.08 TND/clic", color: "border-green-200 bg-green-50" },
];

export default function PublicitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "PRODUCT_BOOST", budget: "", durationDays: "7" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    Promise.all([
      api.get("/ads/stats"),
      api.get("/ads"),
      api.get("/vendors/products"),
    ]).then(([s, c, p]) => {
      setStats(s.data?.data);
      setCampaigns(c.data?.data || []);
      setProducts(p.data?.data || []);
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user, loading]);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.budget || Number(form.budget) <= 0) return;
    setSubmitting(true);
    try {
      const res = await api.post("/ads", {
        productId: form.productId || undefined,
        type: form.type,
        budget: Number(form.budget),
        durationDays: Number(form.durationDays),
      });
      setCampaigns(prev => [res.data.data, ...prev]);
      setForm({ productId: "", type: "PRODUCT_BOOST", budget: "", durationDays: "7" });
      setShowForm(false);
    } catch { alert("Erreur lors de la création"); }
    finally { setSubmitting(false); }
  };

  const toggleCampaign = async (id: string) => {
    try {
      const res = await api.patch(`/ads/${id}/toggle`);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: res.data.data.isActive } : c));
    } catch {}
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    await api.delete(`/ads/${id}`).catch(() => {});
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="skeleton rounded-xl h-32 mb-6" />
        <div className="grid grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton rounded-xl h-24"/>)}</div>
      </main><Footer /></div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">📣 Publicité & Boost</h1>
            <p className="text-slate-500 text-sm mt-0.5">Augmentez votre visibilité sur OPTIMARK</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
            + Nouvelle campagne
          </button>
        </div>

        {/* Stats KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Campagnes actives", value: stats.activeCampaigns, color: "text-green-700" },
              { label: "Budget total", value: `${stats.totalBudget?.toFixed(2)} TND`, color: "text-rose-800" },
              { label: "Dépensé", value: `${stats.totalSpent?.toFixed(2)} TND`, color: "text-slate-800" },
              { label: "Impressions", value: stats.totalImpressions?.toLocaleString(), color: "text-purple-700" },
              { label: "CTR", value: `${stats.ctr}%`, color: "text-amber-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className={`text-xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ad type cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {AD_TYPES.map(t => (
            <div key={t.key} className={`border rounded-xl p-4 ${t.color}`}>
              <span className="text-3xl block mb-2">{t.icon}</span>
              <p className="font-black text-slate-800 text-sm">{t.label}</p>
              <p className="text-slate-500 text-xs mt-0.5 mb-2">{t.desc}</p>
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full">{t.rate}</span>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-black text-slate-800 mb-5">Créer une campagne</h2>
            <form onSubmit={createCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type de campagne</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-rose-800">
                  {AD_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Produit (optionnel)</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-rose-800">
                  <option value="">— Boutique entière —</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Budget (TND)</label>
                <input type="number" min="5" step="0.5" value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  placeholder="Ex: 50 TND"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Durée (jours)</label>
                <select value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-rose-800">
                  {[3, 7, 14, 30].map(d => <option key={d} value={d}>{d} jours</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {submitting ? "Création..." : "Lancer la campagne"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Campaigns list */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">Mes campagnes</h2>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📣</p>
              <p className="font-semibold text-slate-500">Aucune campagne pour l&apos;instant</p>
              <p className="text-sm mt-1">Créez votre première campagne pour booster vos ventes.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {campaigns.map((c: any) => {
                const adType = AD_TYPES.find(t => t.key === c.type) || AD_TYPES[0];
                const isExpired = new Date(c.endsAt) < new Date();
                return (
                  <div key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition">
                    <span className="text-2xl">{adType.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 text-sm">{adType.label}</p>
                        {c.product && <span className="text-xs text-slate-500">— {c.product.title}</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isExpired ? "bg-slate-100 text-slate-500" :
                          c.isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {isExpired ? "Expirée" : c.isActive ? "Active" : "Suspendue"}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-400">
                        <span>Budget: <strong className="text-slate-600">{c.budget?.toFixed(2)} TND</strong></span>
                        <span>Impressions: <strong className="text-slate-600">{c.impressions}</strong></span>
                        <span>Clics: <strong className="text-slate-600">{c.clicks}</strong></span>
                        <span>Fin: <strong className="text-slate-600">{new Date(c.endsAt).toLocaleDateString("fr-FR")}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isExpired && (
                        <button onClick={() => toggleCampaign(c.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                            c.isActive ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-green-300 text-green-700 hover:bg-green-50"
                          }`}>
                          {c.isActive ? "Suspendre" : "Activer"}
                        </button>
                      )}
                      <button onClick={() => deleteCampaign(c.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition">
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing info */}
        <div className="mt-6 bg-gradient-to-r from-slate-900 to-rose-900 rounded-xl p-6 text-white">
          <h3 className="font-black text-lg mb-2">💡 Comment fonctionne la publicité OPTIMARK ?</h3>
          <p className="text-slate-300 text-sm mb-4">Vous définissez un budget et une durée. Votre produit est mis en avant jusqu&apos;à épuisement du budget ou expiration.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AD_TYPES.map(t => (
              <div key={t.key} className="bg-white/10 rounded-lg p-3">
                <span className="text-xl block mb-1">{t.icon}</span>
                <p className="text-xs font-bold text-white">{t.label}</p>
                <p className="text-xs text-slate-300 mt-0.5">{t.rate}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
