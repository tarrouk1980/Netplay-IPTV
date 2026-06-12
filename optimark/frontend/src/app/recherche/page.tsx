"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function RechercheContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [tab, setTab] = useState<"all" | "product" | "service">("all");
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    isVerifiedSeller: false,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = async (q: string, t: string, f: typeof filters) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { q, type: t };
      if (f.category) params.category = f.category;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.isVerifiedSeller) params.isVerifiedSeller = "true";

      const res = await api.get("/search", { params });
      setResults(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) search(query, tab, filters);
  }, [query, tab, filters]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(inputValue);
    }, 300);
  }, [inputValue]);

  const products = results.filter((r) => r.type === "product" || !r.type);
  const services = results.filter((r) => r.type === "service");
  const displayed = tab === "all" ? results : tab === "product" ? products : services;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Rechercher..."
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200">
          {(["all", "product", "service"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-semibold text-sm transition border-b-2 ${
                tab === t ? "border-blue-800 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "all" ? `Tout (${total})` : t === "product" ? `Produits (${products.length})` : `Services (${services.length})`}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-56 shrink-0">
            <h3 className="font-semibold text-slate-700 mb-4">Filtres</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 block mb-1">Catégorie</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  placeholder="ex: électronique"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">Prix min (TND)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">Prix max (TND)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isVerifiedSeller}
                  onChange={(e) => setFilters((f) => ({ ...f, isVerifiedSeller: e.target.checked }))}
                  className="w-4 h-4 accent-blue-800"
                />
                <span className="text-sm text-slate-600">Vendeurs vérifiés</span>
              </label>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : displayed.length === 0 && query ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg mb-2">Aucun résultat pour &ldquo;{query}&rdquo;</p>
                <p className="text-slate-400 text-sm">Essayez d&apos;autres mots-clés ou élargissez vos filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayed.map((item: any) =>
                  item.type === "service" ? (
                    <ServiceCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      provider={item.seller?.name || "Prestataire"}
                      startingPrice={item.price}
                      rating={0}
                      category={item.category}
                      isVerified={item.seller?.isVerified}
                    />
                  ) : (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.promoPrice || item.price}
                      originalPrice={item.promoPrice ? item.price : undefined}
                      seller={item.seller?.name || "Vendeur"}
                      rating={0}
                      isVerified={item.seller?.isVerified}
                      category={item.category}
                      image={item.images?.[0]}
                      isBestSeller={item.isBestSeller}
                      isNewArrival={item.isNewArrival}
                      stock={item.stock}
                      stockAlert={item.stockAlert}
                    />
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
