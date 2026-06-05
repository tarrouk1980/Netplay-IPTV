"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LiveCard from "@/components/LiveCard";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [lives, setLives] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <section className="bg-gradient-to-br from-blue-800 to-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            La marketplace tunisienne<br />qui change tout
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Achetez, vendez et collaborez avec des milliers de Tunisiens. Produits, services et artisans au même endroit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/produits" className="bg-white text-blue-800 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition">
              Explorer
            </Link>
            <Link href="/auth/inscription" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-blue-800 transition">
              Vendre
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Explorez nos catégories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/produits" className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Produits</h3>
              <p className="text-slate-500 text-center">Électronique, mode, maison, alimentation et bien plus encore.</p>
            </Link>
            <Link href="/services" className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Services</h3>
              <p className="text-slate-500 text-center">Freelances tunisiens pour vos projets web, design, marketing et plus.</p>
            </Link>
            <Link href="/produits" className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <span className="text-3xl">🏺</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Artisans</h3>
              <p className="text-slate-500 text-center">Produits artisanaux authentiques directement des artisans tunisiens.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-blue-800 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Une opportunité unique en Tunisie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-extrabold mb-2">12M+</p>
              <p className="text-blue-200 text-lg">internautes tunisiens</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold mb-2">0</p>
              <p className="text-blue-200 text-lg">concurrent local sérieux</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold mb-2">2.1Md$</p>
              <p className="text-blue-200 text-lg">marché e-commerce estimé</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Tendances du moment</h2>
            <Link href="/produits" className="text-blue-800 font-medium text-sm hover:underline">Voir tout</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  seller={p.seller?.name || "Vendeur"}
                  rating={0}
                  isVerified={p.seller?.isVerified}
                  category={p.category}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Aucun produit tendance pour le moment.</p>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse inline-block"></span>
              <h2 className="text-2xl font-bold text-slate-800">Lives en cours</h2>
            </div>
            <Link href="/live" className="text-blue-800 font-medium text-sm hover:underline">Voir tout</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-xl h-56 animate-pulse" />
              ))}
            </div>
          ) : lives.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lives.map((l: any) => (
                <LiveCard
                  key={l.id}
                  id={l.id}
                  title={l.title}
                  vendorName={l.vendor?.name || "Vendeur"}
                  viewerCount={l.viewerCount}
                  isActive={l.isActive}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">Aucun live en cours pour le moment.</p>
              <Link href="/vendeur/live" className="text-blue-800 font-semibold hover:underline text-sm">Démarrer un live</Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Services populaires</h2>
            <Link href="/services" className="text-blue-800 font-medium text-sm hover:underline">Voir tout</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((s: any) => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  provider={s.seller?.name || "Prestataire"}
                  startingPrice={s.price}
                  rating={0}
                  category={s.category}
                  isVerified={s.seller?.isVerified}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Aucun service pour le moment.</p>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Prêt à rejoindre OPTIMARK ?</h2>
          <p className="text-slate-500 text-lg mb-8">
            Créez votre compte gratuitement et commencez à acheter ou vendre dès aujourd&apos;hui.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/inscription" className="bg-blue-800 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-blue-700 transition">
              Créer un compte gratuit
            </Link>
            <Link href="/pricing" className="border-2 border-blue-800 text-blue-800 font-bold px-10 py-4 rounded-xl text-lg hover:bg-blue-50 transition">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
