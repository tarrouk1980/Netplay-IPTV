"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport", "Beauté", "Artisanat"];

function ProduitsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("cat") || "Tous");
  const [sort, setSort] = useState("recent");
  const [brandFilter, setBrandFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<any[]>([]); // max 3 products

  useEffect(() => {
    api.get("/products")
      .then(res => {
        const real = res.data?.data || [];
        setProducts(real.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.promoPrice || p.price,
          originalPrice: p.promoPrice ? p.price : undefined,
          sellerId: p.sellerId,
          seller: p.seller?.name || "Vendeur",
          sellerVerified: !!p.seller?.isVerified,
          rating: p.averageRating || 0,
          reviewCount: p.reviewCount || 0,
          isVerified: !!p.seller?.isVerified,
          category: p.category,
          image: p.images?.[0],
          brand: p.brand || "",
          isBestSeller: !!p.isBestSeller,
          isNewArrival: !!p.isNewArrival,
          stock: p.stock,
          stockAlert: p.stockAlert,
          description: p.description,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => selectedCat === "Tous" || p.category === selectedCat)
    .filter(p => !verifiedOnly || p.isVerified)
    .filter(p => !minPrice || p.price >= parseFloat(minPrice))
    .filter(p => !maxPrice || p.price <= parseFloat(maxPrice))
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !brandFilter || (p.brand || "").toLowerCase().includes(brandFilter.toLowerCase()))
    .sort((a, b) => {
      if (sort === "asc") return a.price - b.price;
      if (sort === "desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "seller") return a.seller.localeCompare(b.seller);
      if (sort === "brand") return (a.brand || "").localeCompare(b.brand || "");
      return 0; // recent
    });

  const toggleCompare = (p: any) => {
    setCompare(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  const goCompare = () => {
    const ids = compare.map(p => p.id).join(",");
    router.push(`/produits/comparer?ids=${ids}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black text-slate-900 mb-4">Tous les produits</h1>
          <div className="flex bg-slate-100 rounded-xl overflow-hidden">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit ou un vendeur..."
              className="flex-1 bg-transparent px-4 py-3 text-slate-700 text-sm focus:outline-none placeholder-slate-400"
            />
            <button className="bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 transition text-sm">
              Rechercher
            </button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${selectedCat === cat ? "bg-rose-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-6 sticky top-20" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="font-black text-slate-800 text-sm uppercase tracking-wider">Filtres</p>

              <div>
                <p className="font-semibold text-slate-700 mb-2 text-sm">Marque</p>
                <input type="text" value={brandFilter} onChange={e => setBrandFilter(e.target.value)} placeholder="ex: Samsung, Nike..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-3 text-sm">Prix (TND)</p>
                <div className="flex gap-2">
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${verifiedOnly ? "bg-rose-800" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Vendeurs vérifiés</span>
                </label>
              </div>

              {compare.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-rose-800 mb-2">Comparaison ({compare.length}/3)</p>
                  {compare.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs text-slate-700 truncate">{p.title}</span>
                      <button onClick={() => toggleCompare(p)} className="text-rose-400 hover:text-rose-700 text-xs">✕</button>
                    </div>
                  ))}
                  {compare.length >= 2 && (
                    <button onClick={goCompare}
                      className="w-full mt-2 bg-rose-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-rose-900 transition">
                      Comparer →
                    </button>
                  )}
                </div>
              )}

              <button onClick={() => { setSearch(""); setSelectedCat("Tous"); setVerifiedOnly(false); setMinPrice(""); setMaxPrice(""); setBrandFilter(""); setCompare([]); }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-sm transition">
                Réinitialiser
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-slate-500 text-sm"><span className="font-bold text-slate-800">{filtered.length}</span> produits</p>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-100 bg-white">
                <option value="recent">Plus récents</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
                <option value="seller">Par vendeur (A→Z)</option>
                <option value="brand">Par marque (A→Z)</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-72" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold">Aucun produit trouvé</p>
                <p className="text-sm mt-1">Essayez d&apos;autres filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard {...product} />
                    <button
                      onClick={() => toggleCompare(product)}
                      title="Ajouter à la comparaison"
                      className={`absolute top-2 left-2 z-10 text-xs font-bold px-2 py-1 rounded-lg transition shadow ${
                        compare.find(x => x.id === product.id)
                          ? "bg-rose-800 text-white"
                          : "bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-rose-50"
                      }`}>
                      {compare.find(x => x.id === product.id) ? "✓ Comparer" : "+ Comparer"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating compare bar */}
      {compare.length >= 2 && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl">
          <span className="text-sm font-bold">{compare.length} produits à comparer</span>
          <button onClick={goCompare} className="bg-rose-800 hover:bg-rose-700 font-bold px-4 py-1.5 rounded-xl text-sm transition">
            Comparer →
          </button>
          <button onClick={() => setCompare([])} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProduitsPage() {
  return <Suspense><ProduitsContent /></Suspense>;
}
