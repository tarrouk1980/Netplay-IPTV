"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import api from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function RechercheContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<"all" | "product" | "service">("all");
  const [results, setResults] = useState<{ products: any[]; services: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", isVerifiedSeller: false });
  const [trendingQueries, setTrendingQueries] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (q: string, f: typeof filters) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const params: Record<string, string> = { q, type: "all" };
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.isVerifiedSeller) params.isVerifiedSeller = "true";
      const res = await api.get("/search", { params });
      const data = res.data?.data || res.data || {};
      setResults({
        products: Array.isArray(data) ? data.filter((r: any) => r.type !== "service") : data.products || [],
        services: Array.isArray(data) ? data.filter((r: any) => r.type === "service") : data.services || [],
      });
    } catch {
      setResults({ products: [], services: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/search/trending").then(r => setTrendingQueries((r.data?.data || []).map((t: any) => t.query).slice(0, 10))).catch(() => {});
  }, []);

  useEffect(() => {
    doSearch(query, filters);
  }, [query, filters]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(inputValue), 350);
  }, [inputValue]);

  useEffect(() => {
    if (suggDebounceRef.current) clearTimeout(suggDebounceRef.current);
    if (!inputValue.trim() || inputValue.trim().length < 2) { setSuggestions([]); return; }
    suggDebounceRef.current = setTimeout(() => {
      api.get("/search/suggestions", { params: { q: inputValue } })
        .then(r => setSuggestions(r.data?.data || []))
        .catch(() => setSuggestions([]));
    }, 200);
  }, [inputValue]);

  const products = results?.products || [];
  const services = results?.services || [];
  const displayed = tab === "all" ? [...products, ...services] : tab === "product" ? products : services;
  const total = products.length + services.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    router.replace(`/recherche?q=${encodeURIComponent(inputValue)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <section className="bg-white border-b border-slate-100 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Rechercher produits, services, artisans..."
                className="w-full border-2 border-slate-200 focus:border-rose-800 rounded-xl px-4 py-3 text-slate-700 outline-none transition text-sm"
                autoFocus
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden z-50">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onMouseDown={() => { setInputValue(s); setQuery(s); setShowSuggestions(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-800 flex items-center gap-2 transition">
                      <span className="text-slate-400">🔍</span> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
              Chercher
            </button>
          </form>
          {query && results && !loading && (
            <p className="text-slate-500 text-sm mt-3">
              <span className="font-semibold text-slate-800">{total}</span> résultat{total !== 1 ? "s" : ""} pour &laquo;{query}&raquo;
            </p>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden md:block w-52 shrink-0">
            <h3 className="font-bold text-slate-700 text-sm mb-4 uppercase tracking-wide">Filtres</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Prix (TND)</label>
                <div className="flex gap-2">
                  <input type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    placeholder="Min" className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-rose-800" />
                  <input type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    placeholder="Max" className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-rose-800" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div onClick={() => setFilters(f => ({ ...f, isVerifiedSeller: !f.isVerifiedSeller }))}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${filters.isVerifiedSeller ? "bg-rose-800 border-rose-800" : "border-slate-300 group-hover:border-rose-400"}`}>
                  {filters.isVerifiedSeller && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-xs text-slate-600">Vendeurs vérifiés uniquement</span>
              </label>
              {(filters.minPrice || filters.maxPrice || filters.isVerifiedSeller) && (
                <button onClick={() => setFilters({ minPrice: "", maxPrice: "", isVerifiedSeller: false })}
                  className="text-xs text-rose-700 font-semibold hover:underline">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            {results && total > 0 && (
              <div className="flex gap-1 mb-6">
                {([
                  { key: "all", label: `Tout (${total})` },
                  { key: "product", label: `Produits (${products.length})` },
                  { key: "service", label: `Services (${services.length})` },
                ] as const).map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? "bg-rose-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-64" />)}
              </div>
            ) : !query ? (
              <div className="py-10 text-slate-400">
                <p className="text-4xl mb-3 text-center">🔍</p>
                <p className="font-semibold text-slate-600 text-center">Que recherchez-vous ?</p>
                <p className="text-sm mt-1 text-center">Tapez un mot-clé pour trouver produits et services.</p>
                {trendingQueries.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🔥 Tendances cette semaine</p>
                    <div className="flex flex-wrap gap-2">
                      {trendingQueries.map(t => (
                        <button key={t} onClick={() => setInputValue(t)}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 font-medium hover:border-rose-800 hover:text-rose-800 transition">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">😕</p>
                <p className="font-bold text-slate-700 text-lg">Aucun résultat pour &laquo;{query}&raquo;</p>
                <p className="text-slate-400 text-sm mt-2">Essayez des mots-clés différents ou élargissez vos filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayed.map((item: any) =>
                  item.type === "service" ? (
                    <ServiceCard key={item.id} id={item.id} title={item.title}
                      provider={item.seller?.name || "Prestataire"}
                      startingPrice={item.price} rating={item.averageRating || 0}
                      category={item.category} isVerified={item.seller?.isVerified} />
                  ) : (
                    <ProductCard key={item.id} id={item.id} title={item.title}
                      price={item.promoPrice || item.price}
                      originalPrice={item.promoPrice ? item.price : undefined}
                      seller={item.seller?.name || "Vendeur"} rating={item.averageRating || 0}
                      isVerified={item.seller?.isVerified} category={item.category}
                      image={item.images?.[0]} isBestSeller={item.isBestSeller}
                      isNewArrival={item.isNewArrival} stock={item.stock} stockAlert={item.stockAlert} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense>
      <RechercheContent />
    </Suspense>
  );
}
