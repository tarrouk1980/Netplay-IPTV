"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AlertesPrixPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/price-alerts")
      .then(r => setAlerts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    await api.delete(`/price-alerts/${productId}`).catch(() => {});
    setAlerts(prev => prev.filter(a => a.productId !== productId));
  };

  const effectivePrice = (p: any) => p.promoPrice ?? p.price;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">📉 Alertes de prix</h1>
        <p className="text-slate-500 text-sm mb-8">Recevez une notification dès que le prix baisse</p>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-slate-500 font-semibold mb-2">Aucune alerte configurée</p>
            <p className="text-slate-400 text-sm">Sur une page produit, cliquez sur &ldquo;🔔 Alerte prix&rdquo; pour être notifié.</p>
            <Link href="/" className="mt-4 inline-block text-rose-800 font-bold hover:underline text-sm">Parcourir les produits →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {a.product?.images?.[0] && (
                  <img src={a.product.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/produits/${a.productId}`} className="font-bold text-slate-800 hover:text-rose-800 transition truncate block">
                    {a.product?.title}
                  </Link>
                  <p className="text-rose-800 font-black text-sm mt-0.5">{effectivePrice(a.product).toFixed(2)} TND</p>
                  {a.targetPrice && (
                    <p className="text-slate-400 text-xs mt-0.5">Objectif : {Number(a.targetPrice).toFixed(2)} TND</p>
                  )}
                </div>
                <button
                  onClick={() => remove(a.productId)}
                  className="text-slate-400 hover:text-rose-600 transition text-sm font-semibold flex-shrink-0"
                >
                  ✕ Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
