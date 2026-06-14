"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClassementPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    api.get("/vendors?limit=20&sortBy=rating")
      .then(r => setSellers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-1">🏆 Classement des vendeurs</h1>
          <p className="text-slate-500 text-sm">Les meilleurs vendeurs OPTIMARK ce mois-ci.</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "week", label: "Cette semaine" },
            { key: "month", label: "Ce mois" },
            { key: "all", label: "Tous les temps" },
          ].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${period === p.key ? "bg-rose-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!loading && sellers.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[sellers[1], sellers[0], sellers[2]].map((s, podiumIdx) => {
              const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const heights = ["h-36", "h-44", "h-32"];
              const tc = rank === 1 ? "bg-yellow-400" : rank === 2 ? "bg-slate-300" : "bg-amber-600";
              return (
                <Link key={s?.id || podiumIdx} href={`/boutique/${s?.id}`}
                  className={`flex flex-col items-center ${podiumIdx === 1 ? "-mt-4" : ""}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-2 border-4 ${rank === 1 ? "border-yellow-400" : rank === 2 ? "border-slate-300" : "border-amber-600"}`}>
                    {s?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="font-black text-slate-800 text-sm text-center">{s?.name}</p>
                  <p className="text-xs text-slate-400">{s?.avgRating?.toFixed(1) ?? "–"} ⭐ · {s?.reviewCount ?? 0} avis</p>
                  <div className={`w-full ${heights[podiumIdx]} ${tc} rounded-t-xl mt-3 flex items-start justify-center pt-2`}>
                    <span className="text-2xl">{MEDALS[rank - 1]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Full ranking list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Aucun vendeur disponible.</div>
        ) : (
          <div className="space-y-3">
            {sellers.map((s, i) => (
              <Link key={s.id} href={`/boutique/${s.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-lg shrink-0">
                  {s.name?.charAt(0)?.toUpperCase() || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800 truncate">{s.name}</p>
                    {s.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">✓ Vérifié</span>}
                    {s.subscriptionPlan === "PRO" && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">⭐ Pro</span>}
                    {s.subscriptionPlan === "BUSINESS" && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">💎 Business</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{s.bio || `Boutique ${s.name}`}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">⭐ {s.avgRating?.toFixed(1) || "–"}</span>
                    <span className="text-xs text-slate-400">{s.reviewCount || 0} avis</span>
                    <span className="text-xs text-slate-400">{s.productCount || 0} produits</span>
                  </div>
                </div>

                <span className="text-slate-300 text-xl shrink-0">›</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
