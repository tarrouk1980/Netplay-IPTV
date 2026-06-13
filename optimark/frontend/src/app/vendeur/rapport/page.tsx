"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendeurRapportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stock, setStock] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    Promise.all([
      api.get("/vendors/earnings"),
      api.get("/vendors/analytics"),
      api.get("/vendors/customers/top"),
      api.get("/vendors/stock/alerts"),
    ]).then(([e, a, c, s]) => {
      setEarnings(e.data?.data);
      setAnalytics(a.data?.data);
      setCustomers(c.data?.data || []);
      setStock(s.data?.data);
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user, loading, router]);

  const print = () => window.print();

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </main><Footer />
    </div>
  );

  const monthData = earnings?.monthly?.find((m: any) => m.month === month);
  const months = earnings?.monthly || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6 print:hidden flex-wrap">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900 flex-1">📋 Rapport vendeur</h1>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
          >
            {months.map((m: any) => (
              <option key={m.month} value={m.month}>{m.month}</option>
            ))}
          </select>
          <button onClick={print} className="bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-rose-900 transition">
            🖨️ Imprimer
          </button>
        </div>

        {/* Report header — visible in print */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4 print:border-0 print:shadow-none" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">OPTIMARK</h2>
              <p className="text-slate-500 text-sm">Rapport mensuel — {month}</p>
              <p className="text-slate-400 text-xs mt-1">Vendeur : {user?.name} · {user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Plan : <strong>{earnings?.subscriptionPlan || "FREE"}</strong></p>
              <p className="text-xs text-slate-400">Commission : <strong>{earnings?.commissionRate}%</strong></p>
              <p className="text-xs text-slate-400">Généré le {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        {/* Monthly KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "CA brut (mois)", value: monthData ? `${monthData.gross} TND` : "—", icon: "💰" },
            { label: "Net après commission", value: monthData ? `${monthData.net} TND` : "—", icon: "✅" },
            { label: "Commission Optimark", value: monthData ? `${monthData.commission} TND` : "—", icon: "📊" },
            { label: "CA total (historique)", value: `${earnings?.totalGross ?? "—"} TND`, icon: "🏆" },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xl mb-1">{k.icon}</p>
              <p className="text-lg font-black text-rose-800">{k.value}</p>
              <p className="text-xs text-slate-500 font-semibold">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Platform stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-black text-slate-800 mb-3 text-sm">📦 Statistiques produits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Note moyenne</span>
                <span className="font-bold text-amber-500">{analytics?.avgRating ?? "—"}★</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total avis</span>
                <span className="font-bold">{analytics?.totalReviews ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vues (30j)</span>
                <span className="font-bold">{analytics?.viewsLast30 ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ruptures de stock</span>
                <span className={`font-bold ${stock?.outOfStock?.length > 0 ? "text-red-600" : "text-green-600"}`}>
                  {stock?.outOfStock?.length ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stock faible</span>
                <span className={`font-bold ${stock?.lowStock?.length > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {stock?.lowStock?.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-black text-slate-800 mb-3 text-sm">👥 Top 5 clients</h3>
            <div className="space-y-2">
              {customers.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-4">#{i + 1}</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                  </div>
                  <span className="font-black text-rose-800">{c.spend} TND</span>
                </div>
              ))}
              {customers.length === 0 && <p className="text-slate-400 text-xs text-center py-2">Aucun client</p>}
            </div>
          </div>
        </div>

        {/* Monthly history table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-black text-slate-800 text-sm">📅 Historique mensuel (6 derniers mois)</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-2 text-left text-xs text-slate-400 font-bold">Mois</th>
                <th className="px-5 py-2 text-right text-xs text-slate-400 font-bold">CA brut</th>
                <th className="px-5 py-2 text-right text-xs text-slate-400 font-bold">Commission</th>
                <th className="px-5 py-2 text-right text-xs text-slate-400 font-bold">Net</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m: any) => (
                <tr key={m.month} className={`border-b border-slate-50 ${m.month === month ? "bg-rose-50" : ""}`}>
                  <td className="px-5 py-2.5 font-semibold text-slate-700">{m.month}</td>
                  <td className="px-5 py-2.5 text-right text-slate-600">{m.gross} TND</td>
                  <td className="px-5 py-2.5 text-right text-red-500">-{m.commission} TND</td>
                  <td className="px-5 py-2.5 text-right font-black text-green-700">{m.net} TND</td>
                </tr>
              ))}
              {months.length === 0 && (
                <tr><td colSpan={4} className="text-center text-slate-400 text-xs py-6">Aucune donnée</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stock alerts */}
        {(stock?.outOfStock?.length > 0 || stock?.lowStock?.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-black text-amber-800 mb-3 text-sm">⚠️ Alertes de stock</h3>
            {stock.outOfStock?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-red-700 mb-2">Ruptures ({stock.outOfStock.length})</p>
                <div className="flex flex-wrap gap-2">
                  {stock.outOfStock.slice(0, 5).map((p: any) => (
                    <span key={p.id} className="text-[11px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{p.title}</span>
                  ))}
                </div>
              </div>
            )}
            {stock.lowStock?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-700 mb-2">Stock faible ({stock.lowStock.length})</p>
                <div className="flex flex-wrap gap-2">
                  {stock.lowStock.slice(0, 5).map((p: any) => (
                    <span key={p.id} className="text-[11px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{p.title} ({p.stock})</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
