"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TendancesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "services">("products");

  useEffect(() => {
    Promise.all([
      api.get("/recommendations/trending?limit=16"),
      api.get("/recommendations/services?limit=12").catch(() => null),
    ]).then(([p, s]) => {
      setProducts(p.data?.data || []);
      setServices(s?.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-1">🔥 Tendances</h1>
          <p className="text-slate-500 text-sm">Les produits et services les plus populaires du moment.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: "products", label: `🛍️ Produits (${products.length})` },
            { key: "services", label: `💼 Services (${services.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 font-bold text-sm border-b-2 transition -mb-px ${tab === t.key ? "border-rose-800 text-rose-800" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : tab === "products" ? (
          products.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune tendance pour le moment.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p, i) => {
                const discount = p.promoPrice ? Math.round((1 - p.promoPrice / p.price) * 100) : null;
                return (
                  <Link key={p.id} href={`/produits/${p.id}`}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition group"
                    style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      {i < 3 && (
                        <span className="absolute top-2 right-2 bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {["🥇", "🥈", "🥉"][i]}
                        </span>
                      )}
                      {discount && (
                        <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-400 mb-2 truncate">{p.seller?.name}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-rose-800 text-sm">{p.promoPrice ?? p.price} TND</span>
                        {p.promoPrice && <span className="text-slate-400 text-xs line-through">{p.price}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          services.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun service tendance pour le moment.</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((s, i) => (
                <Link key={s.id} href={`/services/${s.id}`}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition hover:border-rose-200"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black shrink-0">
                      {i < 3 ? ["🥇","🥈","🥉"][i] : "💼"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{s.title}</p>
                      <p className="text-xs text-slate-400 truncate">{s.seller?.name}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-black text-rose-800">{s.price} TND</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{s.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
