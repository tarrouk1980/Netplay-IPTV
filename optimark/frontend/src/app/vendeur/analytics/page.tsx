"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée",
  DELIVERED: "Livrée", CANCELLED: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", SHIPPED: "#8b5cf6",
  DELIVERED: "#22c55e", CANCELLED: "#ef4444",
};

function BarChart({ data, labelKey, valueKey, color = "#9f1239", height = 120 }: {
  data: any[]; labelKey: string; valueKey: string; color?: string; height?: number;
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span style={{ fontSize: 9 }} className="text-slate-500 font-bold">{d[valueKey]}</span>
          <div className="w-full rounded-t-sm transition-all"
            style={{ height: `${(d[valueKey] / max) * (height - 24)}px`, backgroundColor: color, minHeight: 2 }} />
          <span style={{ fontSize: 9 }} className="text-slate-400 truncate w-full text-center">
            {String(d[labelKey]).slice(-5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutSegment({ percent, color, offset }: { percent: number; color: string; offset: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={18}
      strokeDasharray={`${(percent / 100) * circ} ${circ}`}
      strokeDashoffset={-offset * circ / 100}
      style={{ transition: "stroke-dasharray 0.4s" }} />
  );
}

export default function VendeurAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [perf, setPerf] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    Promise.all([
      api.get("/vendors/analytics"),
      api.get(`/vendors/daily-revenue?days=${period}`),
      api.get("/vendors/performance-score").catch(() => null),
    ]).then(([a, d, p]) => {
      setAnalytics(a.data?.data);
      setDaily(d.data?.data || []);
      setPerf(p?.data?.data || null);
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user, loading, period]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </main><Footer />
    </div>
  );

  const statusTotal = Object.values(analytics?.statusBreakdown || {}).reduce((a: any, b: any) => a + b, 0) as number;
  let statusOffset = 0;
  const statusSegments = Object.entries(analytics?.statusBreakdown || {}).map(([status, count]) => {
    const pct = statusTotal > 0 ? ((count as number) / statusTotal) * 100 : 0;
    const seg = { status, count, pct, color: STATUS_COLORS[status] || "#94a3b8", offset: statusOffset };
    statusOffset += pct;
    return seg;
  });

  const maxRating = Math.max(...(analytics?.ratingDist || []).map((r: any) => r.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900 flex-1">📊 Analytiques avancées</h1>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {([7, 14, 30] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === p ? "bg-rose-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {p}j
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Vues totales", value: analytics?.totalViews ?? "—", sub: `${analytics?.viewsLast30 ?? 0} ces 30j`, icon: "👁️" },
            { label: "Avis clients", value: analytics?.totalReviews ?? "—", sub: `Moy. ${analytics?.avgRating ?? "—"}★`, icon: "⭐" },
            { label: "Note moyenne", value: analytics?.avgRating ? `${analytics.avgRating}/5` : "—", sub: "sur tous les avis", icon: "🏆" },
            { label: "Score vendeur", value: perf?.score != null ? `${perf.score}/100` : "—", sub: perf?.badge || "", icon: "🏅" },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <p className="text-2xl mb-1">{k.icon}</p>
              <p className="text-xl font-black text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500 font-semibold">{k.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Revenue chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-1 text-sm">Revenu journalier (TND)</h2>
            <p className="text-xs text-slate-400 mb-4">Les {period} derniers jours</p>
            {daily.length > 0 ? (
              <BarChart data={daily} labelKey="date" valueKey="revenue" color="#9f1239" height={140} />
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Pas encore de données</p>
            )}
          </div>

          {/* Weekly orders */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-1 text-sm">Commandes hebdomadaires</h2>
            <p className="text-xs text-slate-400 mb-4">8 dernières semaines</p>
            {analytics?.weeklyOrders?.length > 0 ? (
              <BarChart data={analytics.weeklyOrders} labelKey="week" valueKey="count" color="#1e3a5f" height={140} />
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Pas encore de données</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {/* Status donut */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-4 text-sm">Statuts des commandes</h2>
            {statusTotal > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
                  {statusSegments.map((s, i) => (
                    <DonutSegment key={i} percent={s.pct} color={s.color} offset={s.offset} />
                  ))}
                </svg>
                <div className="w-full space-y-1.5">
                  {statusSegments.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-slate-600">{STATUS_LABELS[s.status] || s.status}</span>
                      </div>
                      <span className="font-bold text-slate-800">{s.count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Pas encore de commandes</p>
            )}
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:col-span-2" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-4 text-sm">Top 5 produits par revenu</h2>
            {analytics?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {analytics.topProducts.map((p: any, i: number) => {
                  const maxRev = analytics.topProducts[0].revenue;
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-semibold truncate max-w-[60%]">{i + 1}. {p.title}</span>
                        <span className="font-black text-rose-800">{p.revenue} TND</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-800 rounded-full"
                          style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.quantity} unités vendues</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Pas encore de ventes</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Rating distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-4 text-sm">Distribution des notes</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const entry = analytics?.ratingDist?.find((r: any) => r.rating === star) || { count: 0 };
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400 w-6 shrink-0">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${(entry.count / maxRating) * 100}%` }} />
                    </div>
                    <span className="text-slate-500 w-5 text-right">{entry.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category revenue */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h2 className="font-black text-slate-800 mb-4 text-sm">Revenu par catégorie</h2>
            {analytics?.byCategory?.length > 0 ? (
              <div className="space-y-2">
                {analytics.byCategory.slice(0, 6).map((c: any, i: number) => {
                  const maxCat = analytics.byCategory[0].revenue;
                  const colors = ["#9f1239","#1e3a5f","#065f46","#92400e","#6b21a8","#0c4a6e"];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-600 font-medium truncate">{c.category}</span>
                        <span className="font-bold text-slate-800">{c.revenue} TND</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${(c.revenue / maxCat) * 100}%`, backgroundColor: colors[i % 6] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Pas encore de données</p>
            )}
          </div>
        </div>

        {/* Performance score breakdown */}
        {perf && (
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl p-5 mb-4">
            <h2 className="font-black text-slate-800 mb-4 text-sm">🏆 Détail du score vendeur — {perf.badge}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Délai livraison", value: perf.deliveryScore, max: 30 },
                { label: "Satisfaction", value: perf.ratingScore, max: 30 },
                { label: "Taux annulation", value: perf.cancelScore, max: 20 },
                { label: "Produits actifs", value: perf.productScore, max: 10 },
              ].map((m, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-rose-800">{m.value}<span className="text-xs text-slate-400">/{m.max}</span></p>
                  <p className="text-xs text-slate-600 font-semibold">{m.label}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-rose-800 rounded-full" style={{ width: `${(m.value / m.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 flex-wrap text-sm">
          <Link href="/vendeur/dashboard" className="text-rose-800 hover:underline font-semibold">← Dashboard</Link>
          <Link href="/vendeur/revenus" className="text-rose-800 hover:underline font-semibold">💰 Revenus détaillés →</Link>
          <Link href="/vendeur/avis" className="text-rose-800 hover:underline font-semibold">⭐ Avis clients →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
