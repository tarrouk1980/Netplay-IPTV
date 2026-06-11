"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const CATEGORIES = ["Tous", "Développement web", "Design", "Marketing", "Traduction", "Développement mobile", "Rédaction", "Photographie", "Comptabilité"];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    api.get(`/services?${params}`)
      .then(res => setServices(res.data?.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-1">Services & Freelance</h1>
          <p className="text-slate-500 text-sm">Trouvez des prestataires tunisiens qualifiés pour vos projets.</p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un service..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-800 bg-white text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "Tous" ? "" : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                (cat === "Tous" && !category) || cat === category
                  ? "bg-rose-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">🛠️</span>
            <p className="text-xl font-bold text-slate-700 mb-1">Aucun service trouvé</p>
            <p className="text-slate-400 text-sm">Essayez d&apos;autres filtres ou mots-clés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                provider={service.seller?.name || "Prestataire"}
                startingPrice={service.price}
                rating={service.averageRating || 0}
                category={service.category}
                isVerified={service.seller?.isVerified}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
