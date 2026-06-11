"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const MOCK_PRODUCTS = [
  { id: "1", title: "Smartphone Samsung Galaxy A54", price: 1299.99, originalPrice: 1599.00, seller: "TechStore TN", rating: 4.5, reviewCount: 128, isVerified: true, category: "Électronique", badge: "FLASH", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80" },
  { id: "2", title: "Robe traditionnelle brodée à la main", price: 189.00, seller: "Artisanat Sfax", rating: 4.8, reviewCount: 64, isVerified: true, category: "Mode", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80" },
  { id: "3", title: "Chaise en bois d'olivier artisanale", price: 450.00, originalPrice: 550.00, seller: "Menuiserie Nabeul", rating: 4.2, reviewCount: 21, isVerified: false, category: "Maison", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
  { id: "4", title: "Huile d'olive extra vierge 5L", price: 65.00, seller: "Ferme Bio Sfax", rating: 4.9, reviewCount: 312, isVerified: true, category: "Alimentation", badge: "BIO", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80" },
  { id: "5", title: "Laptop HP 15 Core i5 8Go RAM", price: 2199.00, originalPrice: 2499.00, seller: "ElectroShop", rating: 4.3, reviewCount: 77, isVerified: true, category: "Électronique", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80" },
  { id: "6", title: "Tapis berbère fait main 200x300", price: 780.00, seller: "Artisanat Kairouan", rating: 4.7, reviewCount: 43, isVerified: true, category: "Décoration", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80" },
  { id: "7", title: "Nike Air Max 270 React", price: 299.00, originalPrice: 349.00, seller: "SportZone TN", rating: 4.6, reviewCount: 95, isVerified: true, category: "Sport", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: "8", title: "Tajine en céramique de Nabeul", price: 85.00, seller: "Poterie Nabeul", rating: 4.4, reviewCount: 38, isVerified: false, category: "Maison", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80" },
  { id: "9", title: "Montre connectée Xiaomi Band 8", price: 149.00, originalPrice: 189.00, seller: "TechStore TN", rating: 4.1, reviewCount: 56, isVerified: true, category: "Électronique", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
];

const CATEGORIES = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport"];

export default function ProduitsPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tous");
  const [sort, setSort] = useState("pertinence");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        const real = res.data?.data || [];
        if (real.length > 0) {
          setProducts(real.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.promoPrice || p.price,
            originalPrice: p.promoPrice ? p.price : undefined,
            sellerId: p.sellerId,
            seller: p.seller?.name || "Vendeur",
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            isVerified: !!p.seller?.isVerified,
            category: p.category,
            image: p.images?.[0] || p.image,
            isBestSeller: !!p.isBestSeller,
            isNewArrival: !!p.isNewArrival,
            stock: p.stock,
            stockAlert: p.stockAlert,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => selectedCat === "Tous" || p.category === selectedCat)
    .filter(p => !verifiedOnly || p.isVerified)
    .filter(p => !minPrice || p.price >= parseFloat(minPrice))
    .filter(p => !maxPrice || p.price <= parseFloat(maxPrice))
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "asc") return a.price - b.price;
      if (sort === "desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

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
              placeholder="Rechercher un produit..."
              className="flex-1 bg-transparent px-4 py-3 text-slate-700 text-sm focus:outline-none placeholder-slate-400"
            />
            <button className="bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 transition text-sm">
              Rechercher
            </button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${selectedCat === cat ? "bg-rose-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}
              >
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
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-6 sticky top-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="font-black text-slate-800 text-sm uppercase tracking-wider">Filtres</p>

              <div>
                <p className="font-semibold text-slate-700 mb-3 text-sm">Prix (TND)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${verifiedOnly ? "bg-rose-800" : "bg-slate-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Vendeurs vérifiés</span>
                </label>
              </div>

              <button
                onClick={() => { setSearch(""); setSelectedCat("Tous"); setVerifiedOnly(false); setMinPrice(""); setMaxPrice(""); }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-sm transition"
              >
                Réinitialiser
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-slate-500 text-sm"><span className="font-bold text-slate-800">{filtered.length}</span> produits</p>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value="pertinence">Pertinence</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-72" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold">Aucun produit trouvé</p>
                <p className="text-sm mt-1">Essayez d'autres filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
