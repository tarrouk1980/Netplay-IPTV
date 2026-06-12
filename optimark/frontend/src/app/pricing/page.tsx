"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PLANS = [
  {
    key: "FREE",
    name: "Gratuit",
    price: 0,
    description: "Parfait pour débuter",
    features: ["10 produits max", "Commission 10%", "Support communautaire", "Accès à la marketplace"],
    highlight: false,
  },
  {
    key: "PRO",
    name: "Pro",
    price: 29,
    description: "Pour les vendeurs actifs",
    features: ["100 produits", "Commission 7%", "Badge Pro", "Analytics avancés", "Support email"],
    highlight: true,
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: 79,
    description: "Pour les pros du commerce",
    features: ["Produits illimités", "Commission 5%", "Badge Business", "Analytics avancés", "Live commerce", "Support prioritaire 24/7"],
    highlight: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.get("/subscriptions/me").then(r => setCurrentPlan(r.data?.data)).catch(() => {});
    }
  }, [user]);

  const upgrade = async (planKey: string) => {
    if (!user) { router.push("/auth/connexion?redirect=/pricing"); return; }
    setUpgrading(planKey);
    try {
      await api.post("/subscriptions/upgrade", { plan: planKey });
      const res = await api.get("/subscriptions/me");
      setCurrentPlan(res.data?.data);
      alert(`✓ Plan ${planKey} activé avec succès !`);
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur lors de l'upgrade.");
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 px-4 bg-gradient-to-br from-rose-900 to-rose-700 text-white text-center">
          <h1 className="text-4xl font-black mb-4">Tarifs transparents</h1>
          <p className="text-rose-100 text-lg max-w-xl mx-auto">
            Choisissez le plan qui correspond à votre activité. Pas de frais cachés.
          </p>
          {currentPlan && (
            <div className="inline-block mt-6 bg-white/20 text-white rounded-full px-6 py-2 text-sm font-bold">
              Plan actuel : {currentPlan.plan}
              {currentPlan.subscriptionEnd && ` · Expire le ${new Date(currentPlan.subscriptionEnd).toLocaleDateString("fr-TN")}`}
            </div>
          )}
        </section>

        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map(plan => {
              const isCurrent = currentPlan?.plan === plan.key;
              return (
                <div key={plan.key}
                  className={`relative bg-white rounded-2xl flex flex-col overflow-hidden border-2 transition ${
                    plan.highlight ? "border-rose-800 shadow-xl scale-105" : "border-slate-200 shadow-md"
                  }`}>
                  {plan.highlight && (
                    <div className="bg-rose-800 text-white text-xs font-black text-center py-2 tracking-widest uppercase">
                      ⭐ Recommandé
                    </div>
                  )}
                  {isCurrent && (
                    <div className="bg-green-600 text-white text-xs font-black text-center py-2 tracking-wide uppercase">
                      ✓ Plan actuel
                    </div>
                  )}
                  <div className="p-8 flex-1">
                    <h2 className="text-xl font-black text-slate-800 mb-1">{plan.name}</h2>
                    <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                    <div className="mb-8">
                      <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-1 text-sm">TND / mois</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-slate-700 text-sm">
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 border-t border-slate-100">
                    {plan.key === "FREE" ? (
                      <Link href="/auth/inscription"
                        className="block w-full text-center font-bold py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                        Commencer gratuitement
                      </Link>
                    ) : isCurrent ? (
                      <button disabled className="w-full font-bold py-3 rounded-xl bg-green-100 text-green-700 cursor-default">
                        ✓ Actif
                      </button>
                    ) : (
                      <button onClick={() => upgrade(plan.key)} disabled={!!upgrading}
                        className={`w-full font-bold py-3 rounded-xl transition disabled:opacity-60 ${
                          plan.highlight
                            ? "bg-rose-800 text-white hover:bg-rose-900"
                            : "bg-slate-800 text-white hover:bg-slate-900"
                        }`}>
                        {upgrading === plan.key ? "Activation..." : `Passer au ${plan.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slots info */}
          {currentPlan && (
            <div className="max-w-2xl mx-auto mt-12 bg-white border border-slate-200 rounded-2xl p-6 text-center">
              <p className="font-bold text-slate-800 mb-1">
                {currentPlan.productCount} / {currentPlan.details?.maxProducts === 999 ? "∞" : currentPlan.details?.maxProducts} produits utilisés
              </p>
              <p className="text-slate-500 text-sm">
                {currentPlan.canAddProduct
                  ? `Il vous reste ${currentPlan.remainingSlots === 999 ? "des slots illimités" : `${currentPlan.remainingSlots} slots`}`
                  : "⚠️ Limite atteinte — passez à un plan supérieur pour ajouter plus de produits"}
              </p>
            </div>
          )}

          <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Besoin d&apos;une offre sur mesure ?</h3>
            <p className="text-slate-500 mb-6">Volume important ou besoins spécifiques ? Contactez notre équipe.</p>
            <a href="mailto:contact@optimark.tn" className="bg-rose-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-rose-900 transition">
              Nous contacter
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
