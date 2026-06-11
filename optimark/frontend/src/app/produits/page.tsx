"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Collapsible filter panel with checkboxes
function FilterPanel({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(true);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);
  };

  if (!options.length) return null;

  return (
    <div className="border-b border-slate-100 pb-4 last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="font-semibold text-slate-700 text-sm">{label}</span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
                ${selected.includes(opt) ? "bg-rose-800 border-rose-800" : "border-slate-300 group-hover:border-rose-400"}`}
                onClick={() => toggle(opt)}>
                {selected.includes(opt) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-600 group-hover:text-slate-900 truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Price range panel
function PricePanel({ min, max, onMin, onMax }: {
  min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-100 pb-4">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-left mb-2">
        <span className="font-semibold text-slate-700 text-sm">Prix (TND)</span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="flex gap-2">
          <input type="number" value={min} onChange={e => onMin(e.target.value)} placeholder="Min"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
          <input type="number" value={max} onChange={e => onMax(e.target.value)} placeholder="Max"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-800" />
        </div>
      )}
    </div>
  );
}

function ProduitsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get("cat") ? [searchParams.get("cat")!] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<any[]>([]);

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

  // Derive unique filter options from loaded products
  const allCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
  const allSellers = Array.from(new Set(products.map(p => p.seller).filter(Boolean))).sort();

  const filtered = products
    .filter(p => !selectedCats.length || selectedCats.includes(p.category))
    .filter(p => !selectedBrands.length || selectedBrands.includes(p.brand))
    .filter(p => !selectedSellers.length || selectedSellers.includes(p.seller))
    .filter(p => !verifiedOnly || p.isVerified)
    .filter(p => !minPrice || p.price >= parseFloat(minPrice))
    .filter(p => !maxPrice || p.price <= parseFloat(maxPrice))
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "asc") return a.price - b.price;
      if (sort === "desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "seller") return a.seller.localeCompare(b.seller);
      if (sort === "brand") return (a.brand || "").localeCompare(b.brand || "");
      return 0;
    });

  const toggleCompare = (p: any) => {
    setCompare(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  const goCompare = () => {
    router.push(`/produits/comparer?ids=${compare.map(p => p.id).join(",")}`);
  };

  const hasFilters = selectedCats.length || selectedBrands.length || selectedSellers.length || verifiedOnly || minPrice || maxPrice;

  const resetAll = () => {
    setSearch("");
    setSelectedCats([]);
    setSelectedBrands([]);
    setSelectedSellers([]);
    setVerifiedOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setCompare([]);
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
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Filters sidebar */}
          <aside className="w-full md:w-60 shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 sticky top-20" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between">
                <p className="font-black text-slate-800 text-sm uppercase tracking-wider">Filtres</p>
                {hasFilters ? (
                  <button onClick={resetAll} className="text-xs text-rose-700 hover:underline font-semibold">Tout effacer</button>
                ) : null}
              </div>

              <FilterPanel
                label="Catégorie"
                options={allCategories}
                selected={selectedCats}
                onChange={setSelectedCats}
              />

              <FilterPanel
                label="Marque"
                options={allBrands}
                selected={selectedBrands}
                onChange={setSelectedBrands}
              />

              <FilterPanel
                label="Vendeur"
                options={allSellers}
                selected={selectedSellers}
                onChange={setSelectedSellers}
              />

              <PricePanel min={minPrice} max={maxPrice} onMin={setMinPrice} onMax={setMaxPrice} />

              {/* Verified toggle */}
              <div className="border-b border-slate-100 pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${verifiedOnly ? "bg-rose-800" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">Vendeurs vérifiés</span>
                </label>
              </div>

              {/* Compare list */}
              {compare.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-rose-800 mb-2">Comparaison ({compare.length}/3)</p>
                  {compare.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs text-slate-700 truncate">{p.title}</span>
                      <button onClick={() => toggleCompare(p)} className="text-rose-400 hover:text-rose-700 text-xs flex-shrink-0">✕</button>
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

              <button onClick={resetAll}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-sm transition">
                Réinitialiser
              </button>
            </div>
          </aside>

          <div className="flex-1">
            {/* Active filter chips */}
            {hasFilters ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCats.map(c => (
                  <span key={c} className="flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {c}
                    <button onClick={() => setSelectedCats(selectedCats.filter(x => x !== c))}>✕</button>
                  </span>
                ))}
                {selectedBrands.map(b => (
                  <span key={b} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {b}
                    <button onClick={() => setSelectedBrands(selectedBrands.filter(x => x !== b))}>✕</button>
                  </span>
                ))}
                {selectedSellers.map(s => (
                  <span key={s} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {s}
                    <button onClick={() => setSelectedSellers(selectedSellers.filter(x => x !== s))}>✕</button>
                  </span>
                ))}
                {verifiedOnly && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Vérifiés
                    <button onClick={() => setVerifiedOnly(false)}>✕</button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {minPrice || "0"} – {maxPrice || "∞"} TND
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>✕</button>
                  </span>
                )}
              </div>
            ) : null}

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
                  <ProductCard
                    key={product.id}
                    {...product}
                    onCompare={() => toggleCompare(product)}
                    inCompare={!!compare.find(x => x.id === product.id)}
                  />
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
