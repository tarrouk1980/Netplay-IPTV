"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const METRICS = [
  { key: "rating", label: "Note moyenne", max: 30, icon: "⭐", tip: "Basé sur vos avis clients" },
  { key: "reviews", label: "Volume d'avis", max: 20, icon: "💬", tip: "Plus d'avis = plus de confiance" },
  { key: "products", label: "Catalogue actif", max: 20, icon: "📦", tip: "10+ produits pour le score max" },
  { key: "followers", label: "Abonnés", max: 15, icon: "👥", tip: "50+ abonnés pour le score max" },
  { key: "revenue", label: "Chiffre d'affaires", max: 15, icon: "💰", tip: "Basé sur les commandes livrées" },
];

export default function PerformancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "SELLER") { router.replace("/"); return; }
    api.get("/vendors/performance")
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </main><Footer />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 flex items-center justify-center text-slate-400">Erreur de chargement.</main>
      <Footer />
    </div>
  );

  const scoreColor = data.score >= 80 ? "text-amber-500" : data.score >= 60 ? "text-rose-800" : data.score >= 40 ? "text-blue-600" : "text-slate-500";
  const ringColor = data.score >= 80 ? "#f59e0b" : data.score >= 60 ? "#9f1239" : data.score >= 40 ? "#3b82f6" : "#94a3b8";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/vendeur/dashboard" className="text-slate-400 hover:text-slate-600">← Dashboard</Link>
          <h1 className="text-2xl font-black text-slate-900">📊 Mon score vendeur</h1>
        </div>

        {/* Score ring */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 mb-6 text-center" style={{boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="10"
                  strokeDasharray={`${(data.score / 100) * 264} 264`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${scoreColor}`}>{data.score}</span>
                <span className="text-slate-400 text-xs font-semibold">/100</span>
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${data.score >= 80 ? "bg-amber-50 text-amber-700" : data.score >= 60 ? "bg-rose-50 text-rose-800" : "bg-slate-100 text-slate-600"}`}>
            {data.badge}
          </div>
          <p className="text-slate-400 text-sm mt-1">Score basé sur vos activités et performances</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Commandes livrées", value: data.stats.deliveredOrders, icon: "📦" },
            { label: "Note moyenne", value: data.stats.avgRating > 0 ? `${data.stats.avgRating}★` : "—", icon: "⭐" },
            { label: "Abonnés", value: data.stats.followers, icon: "👥" },
            { label: "Produits actifs", value: data.stats.activeProducts, icon: "🛍️" },
            { label: "Avis clients", value: data.stats.totalReviews, icon: "💬" },
            { label: "Revenus livrés", value: `${data.stats.revenue.toFixed(0)} TND`, icon: "💰" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-lg font-black text-slate-900">{value}</div>
              <div className="text-[10px] text-slate-400 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <h2 className="font-black text-slate-900 mb-5">Détail du score</h2>
          <div className="space-y-4">
            {METRICS.map(({ key, label, max, icon, tip }) => {
              const val = data.breakdown[key] || 0;
              const pct = (val / max) * 100;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{val}<span className="text-slate-300 font-normal">/{max}</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pct}%`, backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#9f1239" : "#f59e0b"}} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{tip}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
          <h2 className="font-black text-rose-900 mb-3">💡 Améliorer votre score</h2>
          <ul className="space-y-2 text-sm text-rose-800">
            {data.stats.avgRating < 4 && <li>• Répondez rapidement aux questions clients pour améliorer votre note</li>}
            {data.stats.totalReviews < 10 && <li>• Demandez à vos acheteurs de laisser un avis après livraison</li>}
            {data.stats.activeProducts < 10 && <li>• Ajoutez plus de produits à votre catalogue (objectif : 10+)</li>}
            {data.stats.followers < 20 && <li>• Partagez votre boutique sur les réseaux sociaux pour gagner des abonnés</li>}
            {data.score < 80 && <li>• Livrez rapidement et soignez l&apos;emballage pour augmenter vos commandes</li>}
            {data.score >= 80 && <li>✓ Excellent travail ! Maintenez ce niveau de qualité.</li>}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
