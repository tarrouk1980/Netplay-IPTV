"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  achieved: boolean;
  progress?: number;
  goal?: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

function computeBadges(data: any): Badge[] {
  const s = data?.seller || {};
  const analytics = data?.analytics || {};
  const orderCount = analytics.totalOrders ?? 0;
  const revenue = analytics.totalRevenue ?? 0;
  const reviewCount = s.reviews?.length ?? 0;
  const avgRating = s.avgRating ?? 0;
  const followerCount = s.followerCount ?? 0;
  const productCount = s.products?.length ?? 0;

  return [
    {
      id: "first_sale", emoji: "🎉", title: "Première vente", tier: "bronze",
      desc: "Réalisez votre première vente sur OPTIMARK.",
      achieved: orderCount >= 1, progress: Math.min(orderCount, 1), goal: 1,
    },
    {
      id: "ten_sales", emoji: "🏅", title: "10 ventes", tier: "silver",
      desc: "Atteignez 10 commandes livrées.",
      achieved: orderCount >= 10, progress: Math.min(orderCount, 10), goal: 10,
    },
    {
      id: "hundred_sales", emoji: "🥇", title: "100 ventes", tier: "gold",
      desc: "Un vrai pro ! 100 commandes livrées.",
      achieved: orderCount >= 100, progress: Math.min(orderCount, 100), goal: 100,
    },
    {
      id: "thousander", emoji: "🚀", title: "Millionnaire", tier: "platinum",
      desc: "1000+ ventes — vous êtes une référence.",
      achieved: orderCount >= 1000, progress: Math.min(orderCount, 1000), goal: 1000,
    },
    {
      id: "first_review", emoji: "⭐", title: "Premier avis", tier: "bronze",
      desc: "Recevez votre premier avis client.",
      achieved: reviewCount >= 1, progress: Math.min(reviewCount, 1), goal: 1,
    },
    {
      id: "top_rated", emoji: "🌟", title: "Top vendeur", tier: "gold",
      desc: "Maintenez une note moyenne ≥ 4.5 avec 10+ avis.",
      achieved: avgRating >= 4.5 && reviewCount >= 10,
      progress: Math.min(reviewCount, 10), goal: 10,
    },
    {
      id: "popular", emoji: "❤️", title: "Boutique populaire", tier: "silver",
      desc: "Atteignez 50 abonnés à votre boutique.",
      achieved: followerCount >= 50, progress: Math.min(followerCount, 50), goal: 50,
    },
    {
      id: "influencer", emoji: "📣", title: "Influenceur", tier: "gold",
      desc: "500+ abonnés à votre boutique.",
      achieved: followerCount >= 500, progress: Math.min(followerCount, 500), goal: 500,
    },
    {
      id: "catalog", emoji: "📦", title: "Grand catalogue", tier: "silver",
      desc: "Publiez 20 produits actifs.",
      achieved: productCount >= 20, progress: Math.min(productCount, 20), goal: 20,
    },
    {
      id: "revenue_1k", emoji: "💰", title: "1 000 TND", tier: "bronze",
      desc: "Générez 1 000 TND de revenus.",
      achieved: revenue >= 1000, progress: Math.min(revenue, 1000), goal: 1000,
    },
    {
      id: "revenue_10k", emoji: "💎", title: "10 000 TND", tier: "gold",
      desc: "Dépassez les 10 000 TND de revenus.",
      achieved: revenue >= 10000, progress: Math.min(revenue, 10000), goal: 10000,
    },
    {
      id: "revenue_100k", emoji: "👑", title: "100 000 TND", tier: "platinum",
      desc: "Vous faites partie de l'élite OPTIMARK.",
      achieved: revenue >= 100000, progress: Math.min(revenue, 100000), goal: 100000,
    },
  ];
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze:   { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", label: "Bronze" },
  silver:   { bg: "#f1f5f9", border: "#94a3b8", text: "#475569", label: "Argent" },
  gold:     { bg: "#fefce8", border: "#eab308", text: "#713f12", label: "Or" },
  platinum: { bg: "#f5f3ff", border: "#8b5cf6", text: "#4c1d95", label: "Platine" },
};

export default function SellerBadgesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/vendors/store/public/me").catch(() => null),
      api.get("/vendors/analytics").catch(() => null),
    ]).then(([s, a]) => {
      setData({ seller: s?.data?.data, analytics: a?.data?.data });
    }).finally(() => setLoading(false));
  }, []);

  const badges = data ? computeBadges(data) : [];
  const achievedCount = badges.filter(b => b.achieved).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-rose-800 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">🏆 Mes badges</h1>
            <p className="text-rose-200 text-sm mt-1">Accomplissements et récompenses vendeur</p>
          </div>
          <Link href="/vendeur/dashboard" className="text-rose-200 hover:text-white text-sm font-semibold">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 flex items-center gap-6"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="text-center">
            <div className="text-3xl font-black text-rose-800">{achievedCount}</div>
            <div className="text-xs text-slate-400 font-medium">Obtenus</div>
          </div>
          <div className="text-slate-200 text-2xl">/</div>
          <div className="text-center">
            <div className="text-3xl font-black text-slate-400">{badges.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total</div>
          </div>
          <div className="flex-1 ml-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progression globale</span>
              <span>{Math.round((achievedCount / badges.length) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-800 rounded-full transition-all"
                style={{ width: `${(achievedCount / badges.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Badges grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {(["bronze", "silver", "gold", "platinum"] as const).map(tier => {
              const tierBadges = badges.filter(b => b.tier === tier);
              const tc = TIER_COLORS[tier];
              return (
                <div key={tier} className="mb-6">
                  <h2 className="text-sm font-black mb-3 uppercase tracking-wide" style={{ color: tc.text }}>
                    {tier === "bronze" ? "🥉" : tier === "silver" ? "🥈" : tier === "gold" ? "🥇" : "💎"} {tc.label}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tierBadges.map(b => (
                      <div key={b.id}
                        className={`rounded-2xl border p-4 transition ${b.achieved ? "" : "opacity-50"}`}
                        style={{ backgroundColor: b.achieved ? tc.bg : "#f8fafc", borderColor: b.achieved ? tc.border : "#e2e8f0" }}>
                        <div className="text-3xl mb-2">{b.emoji}</div>
                        <p className="font-black text-slate-800 text-sm">{b.title}</p>
                        <p className="text-xs text-slate-400 mt-1 mb-3">{b.desc}</p>
                        {!b.achieved && b.progress !== undefined && b.goal && (
                          <>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden mb-1">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${(b.progress / b.goal) * 100}%`, backgroundColor: tc.border }} />
                            </div>
                            <p className="text-[10px] text-slate-400">{b.progress} / {b.goal}</p>
                          </>
                        )}
                        {b.achieved && (
                          <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ color: tc.text, backgroundColor: "rgba(255,255,255,0.5)" }}>
                            ✓ Obtenu
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
