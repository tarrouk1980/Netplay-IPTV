"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import LiveCard from "@/components/LiveCard";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import ServiceCard from "@/components/ServiceCard";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [forYou, setForYou] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, lRes, sRes, fRes, fyRes, tsRes] = await Promise.all([
        api.get("/products/trending").catch(() => null),
        api.get("/live").catch(() => null),
        api.get("/recommendations/services", { params: { limit: 4 } }).catch(() => null),
        api.get("/flash-sales/active").catch(() => null),
        api.get("/recommendations/personalized?limit=8").catch(() => null),
        api.get("/vendors/top", { params: { limit: 8 } }).catch(() => null),
      ]);

      let products = tRes?.data?.data || [];
      if (products.length === 0) {
        const fallback = await api.get("/products", { params: { limit: 8 } }).catch(() => null);
        products = fallback?.data?.data || [];
      }

      setTrending(products);
      setLives(lRes?.data?.data || []);
      setServices(sRes?.data?.data || []);
      setFlashSales((fRes?.data?.data || fRes?.data || []).slice(0, 4));
      setForYou(fyRes?.data?.data || []);
      setTopSellers(tsRes?.data?.data || []);
      setLoading(false);
    };

    fetchAll().catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* ── Hero Slider ── */}
      <HeroSlider />

      <RecentlyViewed />

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

      {/* ── Flash Sales ── */}
      {flashSales.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-r from-rose-900 to-red-700">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <h2 className="text-2xl font-black text-white">Ventes Flash</h2>
                  <p className="text-rose-200 text-sm">Offres limitées — profitez-en avant la fin !</p>
                </div>
              </div>
              <Link href="/ventes-flash" className="text-white font-bold text-sm hover:underline flex items-center gap-1">
                Voir tout <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSales.map((sale: any) => (
                <Link key={sale.id} href={`/produits/${sale.product?.id}`}
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl overflow-hidden transition border border-white/20">
                  <div className="relative">
                    <img src={sale.product?.images?.[0] || "/placeholder.png"} alt={sale.product?.name}
                      className="w-full h-36 object-cover" />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                      -{sale.discount}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-bold truncate">{sale.product?.name}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-white font-black">
                        {(sale.product?.price * (1 - sale.discount / 100)).toFixed(2)} TND
                      </span>
                      <span className="text-rose-200 text-xs line-through">{sale.product?.price} TND</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <ProductCard key={p.id} id={p.id} title={p.title} price={p.promoPrice || p.price} originalPrice={p.promoPrice ? p.price : undefined} seller={p.seller?.name || "Vendeur"} rating={0} isVerified={p.seller?.isVerified} category={p.category} image={p.images?.[0]} isBestSeller={p.isBestSeller} isNewArrival={p.isNewArrival} stock={p.stock} stockAlert={p.stockAlert} />
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

      {/* ── For You (personalized) ── */}
      {user && forYou.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">✨ Pour vous</h2>
                <p className="text-slate-500 text-sm mt-0.5">Sélectionné selon vos préférences</p>
              </div>
              <Link href="/produits" className="text-rose-800 font-bold text-sm hover:underline flex items-center gap-1">
                Voir tout <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {forYou.map((p: any) => (
                <ProductCard key={p.id} id={p.id} title={p.title} price={p.promoPrice || p.price} originalPrice={p.promoPrice ? p.price : undefined} seller={p.seller?.name || "Vendeur"} rating={0} isVerified={p.seller?.isVerified} category={p.category} image={p.images?.[0]} isBestSeller={p.isBestSeller} isNewArrival={p.isNewArrival} stock={p.stock} stockAlert={p.stockAlert} />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* ── Top Sellers ── */}
      {topSellers.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">🏪 Boutiques à la une</h2>
                <p className="text-slate-500 text-sm mt-0.5">Vendeurs vérifiés et recommandés</p>
              </div>
              <Link href="/boutiques" className="text-rose-800 font-bold text-sm hover:underline flex items-center gap-1">
                Voir tout <span>→</span>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {topSellers.map((s: any) => (
                <Link key={s.id} href={`/boutique/${s.id}`}
                  className="flex-shrink-0 w-44 bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-rose-100 transition group">
                  <div className="h-20 bg-gradient-to-r from-rose-100 to-slate-100 relative overflow-hidden">
                    {s.banner && <img src={s.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                    {s.isVerified && <span className="absolute top-1.5 right-1.5 bg-rose-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">✓</span>}
                  </div>
                  <div className="p-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow -mt-6 mb-2 flex items-center justify-center text-lg overflow-hidden">
                      {s.logo ? <img src={s.logo} alt="" className="w-full h-full object-cover" /> : "🏪"}
                    </div>
                    <p className="font-black text-slate-800 text-xs truncate">{s.storeName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">📦 {s.productCount} produits</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* ── Bannières Publicitaires ── */}
      <section className="py-6 px-4 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded">SPONSORISÉ</span>
            <span className="text-slate-400 text-xs">Espaces publicitaires premium</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { bg: "from-amber-400 to-orange-500", icon: "⚡", title: "Flash Deal", sub: "Jusqu'à -70% aujourd'hui", badge: "Expire dans 2h" },
              { bg: "from-rose-700 to-rose-900", icon: "🏆", title: "Produit Vedette", sub: "Boostez votre visibilité x10", badge: "Annonceur" },
              { bg: "from-slate-700 to-slate-900", icon: "📣", title: "Votre Pub Ici", sub: "Touchez 50 000+ acheteurs/jour", badge: "Disponible" },
            ].map(({ bg, icon, title, sub, badge }) => (
              <div key={title} className={`bg-gradient-to-r ${bg} rounded-2xl p-5 text-white flex items-center gap-4 cursor-pointer hover:opacity-90 transition`}>
                <span className="text-4xl">{icon}</span>
                <div className="flex-1">
                  <p className="font-black text-lg">{title}</p>
                  <p className="text-white/80 text-sm">{sub}</p>
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FBO — Fulfillment By OPTIMARK ── */}
      <section className="py-14 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 text-center">
              <div className="w-28 h-28 bg-rose-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-900/50">
                <span className="text-6xl">📦</span>
              </div>
              <span className="bg-rose-800 text-white text-xs font-black px-3 py-1 rounded-full">NOUVEAU</span>
            </div>
            <div className="flex-1">
              <p className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-2">Fulfillment By OPTIMARK</p>
              <h2 className="text-3xl font-black mb-3">Vendez. On s&apos;occupe du reste.</h2>
              <p className="text-slate-400 mb-6">Stockage, emballage, livraison et retours gérés par OPTIMARK. Concentrez-vous sur vos ventes, on fait le reste — comme Amazon FBA mais pour la Tunisie.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: "🏭", text: "Stockage sécurisé" },
                  { icon: "📬", text: "Livraison J+1" },
                  { icon: "↩️", text: "Retours gérés" },
                  { icon: "📊", text: "Suivi en temps réel" },
                ].map(({ icon, text }) => (
                  <div key={text} className="bg-slate-800 rounded-xl p-3 text-center">
                    <span className="text-2xl block mb-1">{icon}</span>
                    <span className="text-xs text-slate-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl transition">
                Démarrer avec FBO →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Livraison Express ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-3xl p-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full mb-4">
                ⚡ OPTIMARK EXPRESS
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Livraison en 24h partout en Tunisie</h2>
              <p className="text-slate-500 mb-5">Abonnez-vous à OPTIMARK Express et profitez de livraisons prioritaires, retours gratuits et accès aux ventes privées.</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {["🚀 Livraison J+1", "↩️ Retours gratuits", "🔒 Paiement sécurisé", "🎁 Ventes privées"].map(t => (
                  <span key={t} className="bg-white border border-rose-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-rose-200">
                Essayer Express gratuit 30 jours →
              </Link>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-rose-800 rounded-full flex items-center justify-center shadow-xl shadow-rose-200 animate-float">
                <span className="text-6xl">🚚</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Vendeur ── */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Dashboard Vendeur Pro</h2>
            <p className="text-slate-500">Gérez votre boutique, vos commandes et vos analyses en temps réel</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: "📊", title: "Analytics IA", desc: "Ventes, conversions, ROI — analysés par l'IA pour optimiser vos revenus", color: "border-purple-200 bg-purple-50" },
              { icon: "🏪", title: "Gestion Boutique", desc: "Ajoutez produits, gérez stock et commandes depuis un seul endroit", color: "border-rose-200 bg-rose-50" },
              { icon: "📣", title: "Publicité Ciblée", desc: "Créez des campagnes publicitaires et boostez vos produits en 1 clic", color: "border-amber-200 bg-amber-50" },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className={`border ${color} rounded-2xl p-6`}>
                <span className="text-4xl block mb-3">{icon}</span>
                <h3 className="font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/vendeur/dashboard" className="inline-flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-md shadow-rose-200">
              Accéder au Dashboard →
            </Link>
          </div>
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

      {/* ── Marques partenaires ── */}
      <section className="py-10 px-4 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Ils nous font confiance</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {["Samsung", "Tunisie Telecom", "Ooredoo", "Monoprix", "Carrefour", "Jumia Pay"].map((name) => (
              <span key={name} className="text-slate-500 font-black text-lg">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="py-14 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Ils nous font confiance</h2>
            <p className="text-slate-500">Plus de 50 000 clients satisfaits en Tunisie</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Sami B.", city: "Tunis", text: "Livraison en 24h comme promis ! Le service FBO change vraiment la donne pour mon e-commerce.", rating: 5 },
              { name: "Amira K.", city: "Sfax", text: "J'ai trouvé des produits artisanaux de qualité que je ne trouvais nulle part ailleurs. Très satisfaite.", rating: 5 },
              { name: "Walid T.", city: "Sousse", text: "Le dashboard vendeur avec l'IA m'a aidé à augmenter mes ventes de 30% en deux mois.", rating: 4 },
            ].map(({ name, city, text, rating }) => (
              <div key={name} className="bg-white border border-slate-100 rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 font-black flex items-center justify-center text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{city}, Tunisie</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Questions fréquentes</h2>
          <div className="space-y-3">
            {[
              { q: "Comment fonctionne la livraison OPTIMARK Express ?", a: "Vos commandes sont livrées en 24h dans toute la Tunisie grâce à notre réseau logistique et au service FBO." },
              { q: "Quels moyens de paiement sont acceptés ?", a: "Carte bancaire, Konnect, Paymee et paiement à la livraison sont disponibles selon les vendeurs." },
              { q: "Comment devenir vendeur sur OPTIMARK ?", a: "Créez un compte vendeur gratuit, ajoutez vos produits depuis le dashboard et commencez à vendre immédiatement." },
              { q: "Puis-je changer la langue ou la devise du site ?", a: "Oui, utilisez les sélecteurs en haut de page pour choisir entre Français, Arabe, Anglais et TND, EUR, USD." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-slate-50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-slate-800 text-sm flex items-center justify-between list-none">
                  {q}
                  <span className="text-rose-800 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-14 px-4 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-4xl block mb-4">📬</span>
          <h2 className="text-2xl font-black text-white mb-2">Ne manquez aucune offre</h2>
          <p className="text-slate-400 mb-6">Recevez les meilleures promotions et nouveautés directement dans votre boîte mail.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-700 text-sm"
            />
            <button className="bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
              S&apos;abonner
            </button>
          </form>
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
