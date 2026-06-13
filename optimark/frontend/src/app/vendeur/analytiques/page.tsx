"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée",
  DELIVERED: "Livrée", CANCELLED: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", SHIPPED: "#8b5cf6",
  DELIVERED: "#22c55e", CANCELLED: "#f43f5e",
};

export default function AnalytiquesPage() {
  const [data, setData] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/vendors/analytics"),
      api.get("/vendors/revenue/daily"),
    ]).then(([aRes, dRes]) => {
      setData(aRes.data.data);
      setDaily(dRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCsv = async () => {
    const res = await api.get("/vendors/orders/export-csv", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "commandes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton rounded-xl h-24" />)}
        </div>
      </main><Footer />
    </div>
  );

  if (!data) return null;

  const maxWeek = Math.max(...(data.weeklyOrders?.map((w: any) => w.count) || [1]), 1);
  const maxCat = Math.max(...(data.byCategory?.map((c: any) => c.revenue) || [1]), 1);
  const maxRating = Math.max(...(data.ratingDist?.map((r: any) => r.count) || [1]), 1);
  const statusEntries = Object.entries(data.statusBreakdown || {});
  const totalOrders = statusEntries.reduce((s, [, v]) => s + (v as number), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-2xl font-black text-slate-900">📊 Analytiques</h1>
          <button onClick={exportCsv} className="text-sm font-bold text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition">
            ⬇️ Exporter commandes CSV
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-8">Performances de votre boutique</p>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Vues produits", value: data.totalViews, sub: `${data.viewsLast30} (30j)`, color: "text-slate-800" },
            { label: "Total commandes", value: totalOrders, sub: "", color: "text-slate-800" },
            { label: "Note moyenne", value: data.avgRating > 0 ? `${data.avgRating}★` : "—", sub: `${data.totalReviews} avis`, color: "text-amber-500" },
            { label: "Top produit", value: data.topProducts?.[0]?.title?.slice(0, 16) + (data.topProducts?.[0]?.title?.length > 16 ? "…" : "") || "—", sub: data.topProducts?.[0] ? `${data.topProducts[0].revenue.toFixed(0)} TND` : "", color: "text-rose-800" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-slate-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Daily revenue SVG line chart */}
        {daily.length > 0 && (() => {
          const maxRev = Math.max(...daily.map((d: any) => d.revenue), 1);
          const W = 700, H = 160, PAD = 30;
          const pts = daily.map((d: any, i: number) => {
            const x = PAD + (i / Math.max(daily.length - 1, 1)) * (W - PAD * 2);
            const y = H - PAD - (d.revenue / maxRev) * (H - PAD * 2);
            return `${x},${y}`;
          });
          const polyline = pts.join(" ");
          const area = `M ${pts[0]} L ${polyline} L ${PAD + (W - PAD * 2)},${H - PAD} L ${PAD},${H - PAD} Z`;
          const totalRevenue = daily.reduce((s: number, d: any) => s + d.revenue, 0);
          const last7 = daily.slice(-7);
          return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <h2 className="font-black text-slate-800">Revenus journaliers (30 derniers jours)</h2>
                <span className="text-rose-800 font-black text-lg">{totalRevenue.toFixed(2)} TND total</span>
              </div>
              <p className="text-slate-400 text-xs mb-4">Évolution quotidienne des ventes</p>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9f1239" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#rev-grad)" />
                <polyline points={polyline} fill="none" stroke="#9f1239" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {daily.map((d: any, i: number) => {
                  const [x, y] = pts[i].split(",").map(Number);
                  return d.revenue > 0 ? <circle key={i} cx={x} cy={y} r="3" fill="#9f1239" /> : null;
                })}
              </svg>
              <div className="flex justify-between text-xs text-slate-400 -mt-1">
                <span>{daily[0]?.date?.slice(5)}</span>
                <span>{daily[daily.length - 1]?.date?.slice(5)}</span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {last7.map((d: any) => (
                  <div key={d.date} className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-xs font-black text-slate-800">{d.revenue > 0 ? `${d.revenue.toFixed(0)}` : "—"}</p>
                    <p className="text-[10px] text-slate-400">{d.date.slice(5)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Weekly orders bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Commandes par semaine</h2>
            {data.weeklyOrders?.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Pas de données</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {data.weeklyOrders?.map((w: any) => (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-rose-800">{w.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-rose-800 transition-all"
                      style={{ height: `${(w.count / maxWeek) * 100}%`, minHeight: 4 }}
                    />
                    <span className="text-slate-400 text-[10px] leading-none">{w.week.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order status donut-style list */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Répartition des statuts</h2>
            {statusEntries.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Pas de données</p>
            ) : (
              <div className="space-y-3">
                {statusEntries.map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">{STATUS_LABELS[status] || status}</span>
                      <span className="font-black text-slate-800">{count as number} <span className="text-slate-400 font-normal text-xs">({Math.round(((count as number) / totalOrders) * 100)}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${((count as number) / totalOrders) * 100}%`, backgroundColor: STATUS_COLORS[status] || "#94a3b8" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Top 5 produits</h2>
            {data.topProducts?.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Pas de ventes encore</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts?.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-6 text-slate-400 text-sm font-black">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{p.title}</p>
                      <p className="text-slate-400 text-xs">{p.quantity} ventes</p>
                    </div>
                    <span className="font-black text-rose-800 text-sm whitespace-nowrap">{p.revenue.toFixed(2)} TND</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue by category */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Revenus par catégorie</h2>
            {data.byCategory?.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Pas de données</p>
            ) : (
              <div className="space-y-3">
                {data.byCategory?.map((c: any) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">{c.category}</span>
                      <span className="font-black text-rose-800">{c.revenue.toFixed(2)} TND</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-rose-800 transition-all" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 className="font-black text-slate-800 mb-4">Distribution des notes</h2>
          {data.totalReviews === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Pas d&apos;avis encore</p>
          ) : (
            <div className="space-y-2 max-w-md">
              {[5, 4, 3, 2, 1].map(r => {
                const entry = data.ratingDist?.find((d: any) => d.rating === r);
                const count = entry?.count || 0;
                return (
                  <div key={r} className="flex items-center gap-3">
                    <span className="text-amber-400 font-black text-sm w-8">{"★".repeat(r)}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: maxRating > 0 ? `${(count / maxRating) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-slate-500 text-xs w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
