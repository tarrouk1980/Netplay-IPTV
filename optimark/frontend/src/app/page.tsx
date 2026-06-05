"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LiveCard from "@/components/LiveCard";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { icon: "📱", label: "Électronique", href: "/produits?cat=electronique" },
  { icon: "👗", label: "Mode", href: "/produits?cat=mode" },
  { icon: "🏺", label: "Artisanat", href: "/produits?cat=decoration" },
  { icon: "💼", label: "Services", href: "/services" },
  { icon: "🏠", label: "Maison", href: "/produits?cat=maison" },
  { icon: "🥘", label: "Alimentation", href: "/produits?cat=alimentation" },
  { icon: "⚽", label: "Sport", href: "/produits?cat=sport" },
];

export default function HomePage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [lives, setLives] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, lRes, sRes] = await Promise.all([
          fetch("/api/recommendations/trending?limit=4"),
          fetch("/api/live"),
          fetch("/api/recommendations/services?limit=4"),
        ]);
        const [tData, lData, sData] = await Promise.all([tRes.json(), lRes.json(), sRes.json()]);
        setTrending(tData.data || []);
        setLives(lData.data || []);
        setServices(sData.data || []);
      } catch {
        setTrending([]);
        setLives([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* ── Hero ── */}
      <section className="relative bg-rose-800 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-700 rounded-full opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-rose-900 rounded-full opacity-50" />
        <div className="absolute top-10 left-1/3 w-40 h-40 bg-white rounded-full opacity-5" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              La marketplace tunisienne #1
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
              Achetez et vendez<br />
              <span className="text-white/90">comme jamais avant</span>
            </h1>

            <p className="text-rose-100 text-lg mb-10 max-w-lg mx-auto">
              Produits, services et artisans tunisiens — au même endroit, en toute confiance.
            </p>

            {/* Hero search bar — IA powered */}
            <div className="max-w-2xl mx-auto mb-3">
              <div className="flex bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center pl-4 flex-shrink-0">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✨ IA
                  </span>
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Décrivez ce que vous cherchez..."
                  className="flex-1 px-4 py-4 text-slate-700 outline-none text-base placeholder-slate-400"
                />
                <Link
                  href={`/produits${heroSearch ? `?q=${encodeURIComponent(heroSearch)}` : ""}`}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-7 py-4 transition flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Chercher</span>
                </Link>
              </div>
              <p className="text-white/60 text-xs mt-2 text-center">✨ Recherche intelligente propulsée par l&apos;IA</p>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.slice(0, 5).map(({ icon, label, href }) => (
                <Link key={label} href={href} className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full transition font-medium">
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "12M+", label: "internautes tunisiens" },
            { value: "100%", label: "paiements sécurisés" },
            { value: "2.1Md$", label: "marché e-commerce TN" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl md:text-4xl font-black text-rose-800">{value}</p>
              <p className="text-slate-500 text-xs md:text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Explorez les catégories</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(({ icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 group-hover:bg-rose-100 rounded-2xl flex items-center justify-center text-3xl transition-all duration-200 group-hover:scale-105 shadow-sm">
                  {icon}
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-rose-800 transition whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Products ── */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Tendances du moment</h2>
              <p className="text-slate-500 text-sm mt-0.5">Les produits les plus populaires</p>
            </div>
            <Link href="/produits" className="text-rose-800 font-bold text-sm hover:underline flex items-center gap-1">
              Voir tout <span>→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-64" />
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map((p: any) => (
                <ProductCard key={p.id} id={p.id} title={p.title} price={p.price} seller={p.seller?.name || "Vendeur"} rating={0} isVerified={p.seller?.isVerified} category={p.category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">📦</span>
              <p className="text-slate-400 font-medium">Aucun produit tendance pour le moment.</p>
              <Link href="/produits" className="text-rose-800 font-semibold text-sm mt-2 inline-block hover:underline">Voir tous les produits →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Live Commerce ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-800 rounded-xl flex items-center justify-center shadow-md shadow-rose-200">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Lives en cours</h2>
                <p className="text-slate-500 text-sm">Commerce en direct</p>
              </div>
            </div>
            <Link href="/live" className="text-rose-800 font-bold text-sm hover:underline flex items-center gap-1">
              Voir tout <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-48" />
              ))}
            </div>
          ) : lives.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lives.map((l: any) => (
                <LiveCard key={l.id} id={l.id} title={l.title} vendorName={l.vendor?.name || "Vendeur"} viewerCount={l.viewerCount} isActive={l.isActive} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-4xl mb-3 block">🎥</span>
              <p className="text-slate-500 font-medium mb-3">Aucun live en cours pour le moment.</p>
              <Link href="/vendeur/live" className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition inline-block">
                Démarrer un live
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Services ── */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Services populaires</h2>
              <p className="text-slate-500 text-sm mt-0.5">Freelances tunisiens de qualité</p>
            </div>
            <Link href="/services" className="text-rose-800 font-bold text-sm hover:underline flex items-center gap-1">
              Voir tout <span>→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-56" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((s: any) => (
                <ServiceCard key={s.id} id={s.id} title={s.title} provider={s.seller?.name || "Prestataire"} startingPrice={s.price} rating={0} category={s.category} isVerified={s.seller?.isVerified} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">💼</span>
              <p className="text-slate-400 font-medium">Aucun service pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AI Features Banner ── */}
      <section className="py-12 px-4 bg-gradient-to-r from-slate-900 to-purple-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-3 py-1 text-purple-300 text-xs font-bold mb-4">
                ✨ Intelligence Artificielle
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">OPTIMARK est propulsé par l&apos;IA</h2>
              <p className="text-slate-400 mb-6">Notre moteur IA analyse vos préférences pour vous proposer les meilleures offres, détecter les fraudes et personnaliser votre expérience.</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "🎯", text: "Recommandations personnalisées" },
                  { icon: "🛡️", text: "Détection de fraudes" },
                  { icon: "💬", text: "Assistant IA 24/7" },
                  { icon: "📊", text: "Prix intelligents" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 w-48 h-48 bg-purple-500/10 border border-purple-400/20 rounded-3xl flex items-center justify-center">
              <span className="text-8xl animate-float">🤖</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-4 bg-rose-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Prêt à rejoindre OPTIMARK ?
          </h2>
          <p className="text-rose-100 text-lg mb-8">
            Créez votre compte gratuitement et commencez à acheter ou vendre dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/inscription" className="bg-white text-rose-800 font-black px-10 py-4 rounded-2xl text-lg hover:bg-rose-50 transition shadow-lg shadow-rose-200/20">
              Créer un compte gratuit
            </Link>
            <Link href="/pricing" className="border-2 border-white/60 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Floating AI Assistant ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-xl shadow-purple-300/40 flex items-center justify-center hover:scale-110 transition-transform">
          <span className="text-2xl">🤖</span>
        </button>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </div>

      <Footer />
    </div>
  );
}
