"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PERIOD_LABELS: Record<string, string> = { "7d": "7 jours", "30d": "30 jours", "3m": "3 mois" };
const PIE_COLORS = ["#1d4ed8", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed"];

export default function VendeurAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "3m">("30d");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/connexion"); return; }
    setLoading(true);
    fetch(`/api/analytics/vendor?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAnalytics(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period, router]);

  const statusData = analytics
    ? Object.entries(analytics.ordersByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Analytics vendeur</h1>
          <div className="flex gap-2">
            {(["7d", "30d", "3m"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  period === p ? "bg-blue-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-slate-500 text-sm mb-1">CA total</p>
                <p className="text-2xl font-extrabold text-blue-800">{analytics.totalRevenue.toFixed(2)} TND</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-slate-500 text-sm mb-1">Commandes</p>
                <p className="text-2xl font-extrabold text-slate-800">{analytics.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-slate-500 text-sm mb-1">Note moyenne</p>
                <p className="text-2xl font-extrabold text-yellow-500">{analytics.avgRating} / 5</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-slate-500 text-sm mb-1">Vues produits</p>
                <p className="text-2xl font-extrabold text-slate-800">{analytics.productViews}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-slate-700 mb-4">Chiffre d&apos;affaires par jour</h2>
                {analytics.dailyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v} TND`, "CA"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-10">Aucune donnée</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-slate-700 mb-4">Commandes par statut</h2>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-10">Aucune donnée</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-700 mb-4">Top 5 produits</h2>
              {analytics.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="title" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-sm text-center py-10">Aucune donnée</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-center py-20">Impossible de charger les analytics.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
