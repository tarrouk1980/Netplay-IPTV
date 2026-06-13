"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ScoreRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : score >= 20 ? "#f97316" : "#ef4444";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
      <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={14}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 0.5s" }} />
      <text x={70} y={66} textAnchor="middle" fontSize={28} fontWeight="900" fill={color}>{score}</text>
      <text x={70} y={85} textAnchor="middle" fontSize={11} fill="#94a3b8">/100</text>
    </svg>
  );
}

export default function VendeurQualitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [perf, setPerf] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    api.get("/vendors/performance-score")
      .then(r => setPerf(r.data?.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </main><Footer />
    </div>
  );

  const score = perf?.score ?? 0;
  const stats = perf?.stats || {};
  const breakdown = perf?.breakdown || {};

  const CHECKS = [
    {
      label: "Note moyenne ≥ 4★",
      ok: stats.avgRating >= 4,
      value: `${stats.avgRating ?? 0}/5`,
      tip: "Répondez rapidement aux questions clients et soignez vos emballages.",
      link: "/vendeur/avis",
      linkLabel: "Voir les avis",
      score: breakdown.rating,
      maxScore: 30,
    },
    {
      label: "Au moins 20 avis reçus",
      ok: stats.totalReviews >= 20,
      value: `${stats.totalReviews ?? 0} avis`,
      tip: "Encouragez vos clients à laisser un avis après la livraison.",
      link: "/vendeur/avis",
      linkLabel: "Voir les avis",
      score: breakdown.reviews,
      maxScore: 20,
    },
    {
      label: "10+ produits actifs",
      ok: stats.activeProducts >= 10,
      value: `${stats.activeProducts ?? 0} produits`,
      tip: "Étoffez votre catalogue pour apparaître dans plus de recherches.",
      link: "/vendeur/produits",
      linkLabel: "Gérer les produits",
      score: breakdown.products,
      maxScore: 20,
    },
    {
      label: "50+ abonnés à votre boutique",
      ok: stats.followers >= 50,
      value: `${stats.followers ?? 0} abonnés`,
      tip: "Partagez votre boutique sur les réseaux et envoyez des messages à vos abonnés.",
      link: "/vendeur/boutique",
      linkLabel: "Voir ma boutique",
      score: breakdown.followers,
      maxScore: 15,
    },
    {
      label: "Revenu total > 5 000 TND",
      ok: stats.revenue >= 5000,
      value: `${(stats.revenue ?? 0).toFixed(0)} TND`,
      tip: "Proposez des offres groupées et des promotions pour booster vos ventes.",
      link: "/vendeur/flash-ventes",
      linkLabel: "Créer une vente flash",
      score: breakdown.revenue,
      maxScore: 15,
    },
  ];

  const badgeColor = score >= 80 ? "text-green-700 bg-green-50 border-green-200"
    : score >= 60 ? "text-blue-700 bg-blue-50 border-blue-200"
    : score >= 40 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900">🏆 Qualité vendeur</h1>
        </div>

        {/* Score overview */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 flex items-center gap-8 flex-wrap" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div className="shrink-0">
            <ScoreRing score={score} />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 text-sm mb-1">Votre niveau actuel</p>
            <span className={`inline-block text-lg font-black px-4 py-1 rounded-full border ${badgeColor} mb-3`}>
              {perf?.badge}
            </span>
            <p className="text-slate-600 text-sm">
              {score >= 80
                ? "Félicitations ! Vous êtes parmi les meilleurs vendeurs de la plateforme."
                : score >= 60
                ? "Beau travail ! Quelques améliorations vous permettront d'atteindre l'élite."
                : score >= 40
                ? "Vous progressez bien. Consultez les recommandations ci-dessous."
                : "Votre boutique est encore jeune. Suivez nos conseils pour progresser rapidement."}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-6">
          <h2 className="font-black text-slate-800 mb-2">Critères d'évaluation</h2>
          {CHECKS.map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl border p-5 ${c.ok ? "border-green-100" : "border-slate-100"}`}
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start gap-3">
                <span className={`text-xl shrink-0 mt-0.5 ${c.ok ? "text-green-500" : "text-slate-300"}`}>
                  {c.ok ? "✅" : "⬜"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <p className={`font-bold text-sm ${c.ok ? "text-green-700" : "text-slate-700"}`}>{c.label}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.ok ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {c.value}
                      </span>
                      <span className="text-xs text-slate-400">{c.score}/{c.maxScore} pts</span>
                    </div>
                  </div>
                  {!c.ok && (
                    <p className="text-slate-500 text-xs mb-2">💡 {c.tip}</p>
                  )}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(c.score / c.maxScore) * 100}%`, backgroundColor: c.ok ? "#22c55e" : "#9f1239" }} />
                  </div>
                  {!c.ok && (
                    <Link href={c.link} className="text-xs font-bold text-rose-800 hover:underline">{c.linkLabel} →</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 text-white">
          <h3 className="font-black mb-2">📈 Prochaines étapes</h3>
          <ul className="space-y-1.5 text-sm text-slate-300">
            {CHECKS.filter(c => !c.ok).slice(0, 3).map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 shrink-0">→</span>
                <span>{c.label} — {c.tip}</span>
              </li>
            ))}
            {CHECKS.every(c => c.ok) && (
              <li className="text-green-400 font-bold">🎉 Tous les critères sont atteints ! Maintenez ce niveau.</li>
            )}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
