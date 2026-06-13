"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const PLANS = [
  {
    key: "FREE",
    name: "Gratuit",
    price: 0,
    color: "border-slate-200",
    bg: "bg-white",
    badge: null,
    features: ["10 produits max", "Commission 10%", "Accès basique", "Support standard"],
    cta: "Plan actuel",
  },
  {
    key: "PRO",
    name: "Pro",
    price: 29,
    color: "border-rose-300",
    bg: "bg-white",
    badge: "PRO",
    features: ["100 produits max", "Commission 7%", "Analytiques avancées", "Support prioritaire", "Badge Pro"],
    cta: "Passer au Pro",
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: 79,
    color: "border-purple-300",
    bg: "bg-gradient-to-br from-purple-50 to-white",
    badge: "BUSINESS",
    features: ["Produits illimités", "Commission 5%", "Analytiques premium", "Support dédié", "Badge Business", "Accès API"],
    cta: "Passer au Business",
  },
];

export default function AbonnementPage() {
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/subscriptions/current")
      .then(r => setCurrent(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upgrade = async (plan: string) => {
    if (!confirm(`Activer le plan ${plan} pour 30 jours ?`)) return;
    setUpgrading(plan);
    try {
      const res = await api.post("/subscriptions/upgrade", { plan });
      setSuccess(res.data.message);
      const updated = await api.get("/subscriptions/current");
      setCurrent(updated.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur lors de l'upgrade.");
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">💎 Plans & Abonnements</h1>
        <p className="text-slate-500 text-sm mb-8">Choisissez le plan qui correspond à vos besoins</p>

        {success && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 mb-6 text-green-700 font-semibold text-sm">
            ✅ {success}
          </div>
        )}

        {current && (
          <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 mb-8 flex items-center justify-between flex-wrap gap-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div>
              <p className="text-sm text-slate-500">Plan actuel</p>
              <p className="font-black text-slate-900">{current.plan} — {current.details?.name}</p>
              {current.subscriptionEnd && <p className="text-xs text-slate-400 mt-0.5">Expire le {new Date(current.subscriptionEnd).toLocaleDateString("fr-FR")}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{current.productCount} / {current.details?.maxProducts === 999 ? "∞" : current.details?.maxProducts} produits</p>
              <p className="text-xs text-slate-400">Commission : {current.details?.commission}%</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const isCurrent = current?.plan === plan.key;
            return (
              <div key={plan.key} className={`${plan.bg} rounded-2xl border-2 ${plan.color} p-6 flex flex-col`} style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
                {plan.badge && (
                  <span className={`self-start text-xs font-black px-3 py-1 rounded-full mb-3 ${plan.badge === "BUSINESS" ? "bg-purple-100 text-purple-700" : "bg-rose-100 text-rose-700"}`}>
                    {plan.badge}
                  </span>
                )}
                <h2 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-3xl font-black text-slate-900 mb-1">
                  {plan.price === 0 ? "Gratuit" : `${plan.price} TND`}
                  {plan.price > 0 && <span className="text-sm font-medium text-slate-400"> /mois</span>}
                </p>
                <ul className="mt-4 mb-6 space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="text-center py-3 text-slate-400 font-semibold text-sm border-2 border-slate-200 rounded-xl">
                    Plan actuel
                  </div>
                ) : plan.key === "FREE" ? (
                  <div className="text-center py-3 text-slate-300 font-semibold text-sm border-2 border-slate-100 rounded-xl">
                    —
                  </div>
                ) : (
                  <button
                    onClick={() => upgrade(plan.key)}
                    disabled={!!upgrading}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition ${plan.badge === "BUSINESS" ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-rose-800 text-white hover:bg-rose-900"} disabled:opacity-50`}
                  >
                    {upgrading === plan.key ? "Activation..." : plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-sm text-amber-700">
          <p className="font-bold mb-1">⚠️ Note sur les paiements</p>
          <p>En production, les upgrades sont traités via Konnect ou PayMee. En mode test, l&apos;upgrade est appliqué directement sans paiement.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
