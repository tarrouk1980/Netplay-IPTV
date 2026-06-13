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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vendors/analytics")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-black text-slate-900 mb-1">📊 Analytiques</h1>
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
