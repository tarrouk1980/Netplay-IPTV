"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BoutiquesPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    api.get("/vendors/top", { params: { limit: 40 } })
      .then(r => setSellers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(sellers.map(s => s.category).filter(Boolean))];

  const filtered = sellers.filter(s => {
    const matchSearch = !search || s.storeName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-rose-900 py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-3">🏪 Découvrez nos boutiques</h1>
          <p className="text-rose-200 text-lg mb-6">Des milliers de vendeurs tunisiens vérifiés à votre service</p>
          <div className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une boutique..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-rose-200 outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="px-4 py-3 bg-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/20 transition">
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setCategoryFilter("")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${!categoryFilter ? "bg-rose-800 text-white border-rose-800" : "bg-white border-slate-200 text-slate-600 hover:border-rose-300"}`}>
              Toutes
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${categoryFilter === cat ? "bg-rose-800 text-white border-rose-800" : "bg-white border-slate-200 text-slate-600 hover:border-rose-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && (
          <p className="text-slate-500 text-sm mb-6">
            <span className="font-semibold text-slate-800">{filtered.length}</span> boutique{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-52" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏪</p>
            <p className="text-xl font-bold text-slate-700">Aucune boutique trouvée</p>
            <p className="text-slate-400 text-sm mt-2">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((s: any) => (
              <Link key={s.id} href={`/boutique/${s.id}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-rose-100 transition-all duration-200">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-rose-100 to-slate-100 relative overflow-hidden">
                  {s.banner && (
                    <img src={s.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {s.isVerified && (
                    <div className="absolute top-2 right-2 bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      ✓ Vérifié
                    </div>
                  )}
                </div>

                {/* Logo + name */}
                <div className="p-4">
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md -mt-8 mb-3 overflow-hidden flex items-center justify-center text-2xl">
                    {s.logo ? <img src={s.logo} alt="" className="w-full h-full object-cover" /> : "🏪"}
                  </div>
                  <h3 className="font-black text-slate-900 text-sm truncate group-hover:text-rose-800 transition">{s.storeName || "Boutique"}</h3>
                  {s.category && <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">
                      📦 <span className="font-semibold">{s.productCount}</span> produits
                    </span>
                    <span className="text-xs text-slate-500">
                      👥 <span className="font-semibold">{s.followerCount}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
