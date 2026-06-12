"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface FlashSale {
  id: string;
  discount: number;
  startAt: string;
  endAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    seller: { name: string };
  };
}

function Countdown({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState("");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Terminé"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    calc();
    ref.current = setInterval(calc, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [endAt]);

  return <span>{remaining}</span>;
}

export default function VentesFlashPage() {
  const [active, setActive] = useState<FlashSale[]>([]);
  const [upcoming, setUpcoming] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/flash-sales/active"),
      api.get("/flash-sales/upcoming"),
    ]).then(([a, u]) => {
      setActive(a.data?.data || a.data || []);
      setUpcoming(u.data?.data || u.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const discounted = (price: number, pct: number) => (price * (1 - pct / 100)).toFixed(2);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-14 px-4 bg-gradient-to-br from-rose-900 to-red-600 text-white text-center">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-4xl font-black mb-2">Ventes Flash</h1>
          <p className="text-rose-100 text-lg">Des offres limitées dans le temps — ne ratez pas votre chance !</p>
        </section>

        <section className="py-14 px-4 max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Chargement des offres...</div>
          ) : active.length === 0 && upcoming.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">😴</p>
              <p className="font-bold text-slate-700 text-xl">Aucune vente flash en ce moment</p>
              <p className="text-slate-400 mt-2">Revenez plus tard ou explorez nos produits.</p>
              <Link href="/produits" className="inline-block mt-6 bg-rose-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-rose-900 transition">
                Voir tous les produits
              </Link>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-2xl font-black text-slate-800">En cours maintenant</h2>
                    <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                      {active.length} offre{active.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {active.map(sale => (
                      <Link key={sale.id} href={`/produits/${sale.product.id}`}
                        className="group bg-white rounded-2xl border-2 border-red-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">
                        <div className="relative">
                          <img
                            src={sale.product.images?.[0] || "/placeholder.png"}
                            alt={sale.product.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-sm font-black px-3 py-1 rounded-full shadow">
                            -{sale.discount}%
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="font-bold text-slate-800 text-sm truncate mb-1">{sale.product.name}</p>
                          <p className="text-xs text-slate-400 mb-3">{sale.product.seller?.name}</p>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-black text-red-600">
                              {discounted(sale.product.price, sale.discount)} TND
                            </span>
                            <span className="text-sm text-slate-400 line-through">
                              {sale.product.price} TND
                            </span>
                          </div>
                          <div className="bg-slate-800 text-white text-xs font-mono font-bold text-center py-1.5 rounded-lg">
                            ⏱ <Countdown endAt={sale.endAt} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {upcoming.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🗓️</span>
                    <h2 className="text-2xl font-black text-slate-800">Bientôt disponibles</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {upcoming.map(sale => (
                      <div key={sale.id}
                        className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden opacity-80">
                        <div className="relative">
                          <img
                            src={sale.product.images?.[0] || "/placeholder.png"}
                            alt={sale.product.name}
                            className="w-full h-48 object-cover grayscale"
                          />
                          <div className="absolute top-2 left-2 bg-amber-500 text-white text-sm font-black px-3 py-1 rounded-full shadow">
                            -{sale.discount}%
                          </div>
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="bg-white/90 text-slate-800 font-black text-xs px-4 py-2 rounded-full">
                              Commence bientôt
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="font-bold text-slate-800 text-sm truncate mb-1">{sale.product.name}</p>
                          <p className="text-xs text-slate-400 mb-2">{sale.product.seller?.name}</p>
                          <p className="text-xs text-amber-600 font-bold">
                            Début : {new Date(sale.startAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
