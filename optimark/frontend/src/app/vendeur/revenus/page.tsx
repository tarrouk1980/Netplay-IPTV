"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-slate-100 text-slate-700",
  PRO: "bg-blue-100 text-blue-700",
  BUSINESS: "bg-amber-100 text-amber-700",
};

export default function SellerEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vendors/earnings").then(r => setData(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxNet = data?.monthly?.length ? Math.max(...data.monthly.map((m: any) => m.net), 1) : 1;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-6">💰 Revenus & commissions</h1>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
        ) : !data ? (
          <p className="text-slate-400">Impossible de charger les données.</p>
        ) : (
          <>
            {/* Plan badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-6 ${PLAN_COLORS[data.subscriptionPlan] || PLAN_COLORS.FREE}`}>
              Plan {data.subscriptionPlan} — Commission : {data.commissionRate}%
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Revenus bruts", value: `${data.totalGross.toFixed(2)} TND`, color: "text-slate-800" },
                { label: "Commission OPTIMARK", value: `-${data.totalCommission.toFixed(2)} TND`, color: "text-red-600" },
                { label: "Revenus nets", value: `${data.totalNet.toFixed(2)} TND`, color: "text-rose-800" },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <p className={`text-2xl font-black ${card.color} mb-1`}>{card.value}</p>
                  <p className="text-xs text-slate-500 font-semibold">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Monthly breakdown */}
            {data.monthly?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h2 className="font-black text-slate-900 mb-5">Historique mensuel</h2>

                {/* Bar chart */}
                <div className="flex items-end gap-3 h-24 mb-6">
                  {[...data.monthly].reverse().map((m: any) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-rose-800 rounded-t-lg" style={{ height: `${Math.max(4, (m.net / maxNet) * 80)}px` }} />
                      <span className="text-xs text-slate-400 font-semibold">{m.month.slice(5)}</span>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mois</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Brut</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-rose-700 uppercase">Commission</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthly.map((m: any, i: number) => (
                        <tr key={m.month} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-4 py-3 font-semibold text-slate-800">{m.month}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{m.gross.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-red-500 font-semibold">-{m.commission.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-black text-rose-800">{m.net.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tip to upgrade */}
            {data.subscriptionPlan === 'FREE' && (
              <div className="mt-6 bg-gradient-to-r from-rose-800 to-rose-900 rounded-2xl p-5 text-white">
                <p className="font-black text-lg mb-1">💎 Réduisez votre commission</p>
                <p className="text-rose-200 text-sm mb-3">Passez au plan PRO (7%) ou BUSINESS (5%) pour garder plus de vos revenus.</p>
                <a href="/vendeur/abonnement" className="inline-block bg-white text-rose-800 font-bold text-sm px-4 py-2 rounded-xl hover:bg-rose-50 transition">
                  Voir les plans →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
