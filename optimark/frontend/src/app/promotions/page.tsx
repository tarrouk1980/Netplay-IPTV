"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

function Countdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Terminé"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return <span className="font-mono text-rose-800 font-black">{remaining}</span>;
}

export default function PromotionsPage() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"flash" | "promo">("flash");

  useEffect(() => {
    Promise.all([
      api.get("/flash-sales/active").catch(() => null),
      api.get("/products?hasPromo=true&limit=20").catch(() => null),
    ]).then(([fs, pp]) => {
      setFlashSales(fs?.data?.data || []);
      setPromoProducts((pp?.data?.data || []).filter((p: any) => p.promoPrice));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-1">🏷️ Promotions & Soldes</h1>
          <p className="text-slate-500 text-sm">Toutes les ventes flash et offres en cours sur la plateforme.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: "flash", label: `⚡ Ventes Flash (${flashSales.length})` },
            { key: "promo", label: `🔖 Prix barrés (${promoProducts.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 font-bold text-sm border-b-2 transition -mb-px ${tab === t.key ? "border-rose-800 text-rose-800" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : tab === "flash" ? (
          flashSales.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-4xl mb-3">⚡</p>
              <p className="font-bold text-slate-700 mb-2">Aucune vente flash active</p>
              <p className="text-slate-400 text-sm">Revenez bientôt pour découvrir les prochaines offres !</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {flashSales.map(sale => {
                const discount = sale.discountPercent;
                return (
                  <div key={sale.id} className="bg-white rounded-2xl border border-rose-100 overflow-hidden"
                    style={{ boxShadow: "0 2px 12px rgba(159,18,57,0.08)" }}>
                    <div className="bg-rose-800 px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-lg">{sale.title || "Vente Flash"}</p>
                        <p className="text-rose-200 text-xs">{sale.product?.title || "Produit"}</p>
                      </div>
                      <span className="bg-white text-rose-800 font-black text-xl px-3 py-1 rounded-xl">
                        -{discount}%
                      </span>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-2xl font-black text-rose-800">{sale.flashPrice} TND</p>
                          <p className="text-slate-400 text-sm line-through">{sale.product?.price} TND</p>
                        </div>
                        {sale.stock != null && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">{sale.stock} restant(s)</p>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-800 rounded-full"
                                style={{ width: `${Math.min((sale.stock / (sale.initialStock || sale.stock)) * 100, 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          ⏱ Se termine dans : <Countdown endsAt={sale.endsAt} />
                        </div>
                        {sale.product?.id && (
                          <Link href={`/produits/${sale.product.id}`}
                            className="bg-rose-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-900 transition">
                            Voir →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          promoProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-4xl mb-3">🔖</p>
              <p className="font-bold text-slate-700">Aucun produit en promotion actuellement</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {promoProducts.map(p => {
                const pct = Math.round((1 - p.promoPrice / p.price) * 100);
                return (
                  <Link key={p.id} href={`/produits/${p.id}`}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition group"
                    style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div className="h-36 bg-slate-100 relative overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <span className="absolute top-2 left-2 bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{pct}%
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-800 text-xs truncate mb-1">{p.title}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-rose-800 text-sm">{p.promoPrice} TND</span>
                        <span className="text-slate-400 text-xs line-through">{p.price}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
