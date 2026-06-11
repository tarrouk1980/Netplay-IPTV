"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const STATUS: Record<string, { label: string; color: string; step: number }> = {
  PENDING:   { label: "En attente",  color: "text-amber-600",  step: 0 },
  CONFIRMED: { label: "Confirmée",   color: "text-blue-600",   step: 1 },
  SHIPPED:   { label: "Expédiée",    color: "text-purple-600", step: 2 },
  DELIVERED: { label: "Livrée",      color: "text-green-600",  step: 3 },
  CANCELLED: { label: "Annulée",     color: "text-red-600",    step: -1 },
};

const STEPS = ["En attente", "Confirmée", "Expédiée", "Livrée"];

export default function CommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion"); return; }
    api.get(`/orders/${id}/invoice`)
      .then(res => setOrder(res.data?.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [user, authLoading, id, router]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-4">
        {Array.from({length:3}).map((_,i) => <div key={i} className="skeleton rounded-2xl h-24"/>)}
      </main><Footer />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-xl font-bold text-slate-700 mb-4">Commande introuvable</p>
        <Link href="/commandes" className="text-rose-800 hover:underline font-semibold">← Mes commandes</Link>
      </main><Footer />
    </div>
  );

  const status = STATUS[order.status] || STATUS.PENDING;
  const addr = order.deliveryAddress;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/commandes" className="text-slate-400 hover:text-slate-600 transition">←</Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Commande #{order.id?.slice(0,8).toUpperCase()}</h1>
            <p className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
        </div>

        {/* Statut tracker */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-4" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                    i <= status.step ? "bg-rose-800 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {i < status.step ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold text-center ${i <= status.step ? "text-rose-800" : "text-slate-400"}`}>{s}</span>
                  {i < STEPS.length - 1 && (
                    <div className="absolute" style={{display:"none"}} />
                  )}
                </div>
              ))}
            </div>
            <div className="relative flex items-center h-1 bg-slate-100 rounded-full mt-1 mx-4">
              <div className="h-1 bg-rose-800 rounded-full transition-all" style={{width: `${(status.step / (STEPS.length - 1)) * 100}%`}} />
            </div>
          </div>
        )}

        {order.status === "CANCELLED" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <p className="font-bold text-red-700">Cette commande a été annulée.</p>
          </div>
        )}

        {/* Articles */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <h2 className="font-black text-slate-900 mb-4">Articles commandés</h2>
          <div className="divide-y divide-slate-50">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {item.product?.images?.[0]
                    ? <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover"/>
                    : <span className="text-2xl">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.product?.title}</p>
                  <p className="text-slate-400 text-xs">Vendu par {item.product?.seller?.name || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-rose-800">{(item.price * item.quantity).toFixed(2)} TND</p>
                  <p className="text-slate-400 text-xs">{item.quantity} × {Number(item.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between">
            <span className="font-bold text-slate-700">Total</span>
            <span className="font-black text-lg text-rose-800">{Number(order.total).toFixed(2)} TND</span>
          </div>
        </div>

        {/* Livraison */}
        {addr && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 className="font-black text-slate-900 mb-3">📍 Adresse de livraison</h2>
            <p className="font-semibold text-slate-800">{addr.fullName}</p>
            <p className="text-slate-500 text-sm">{addr.phone}</p>
            <p className="text-slate-500 text-sm">{addr.address}</p>
            <p className="text-slate-500 text-sm">{addr.city}{addr.postalCode ? ` ${addr.postalCode}` : ""}</p>
            {addr.notes && <p className="text-slate-400 text-xs italic mt-1">"{addr.notes}"</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <a href={`/commandes/${order.id}/facture`} target="_blank"
            className="flex-1 text-center bg-white border border-slate-200 hover:border-rose-300 text-slate-700 font-bold py-3 rounded-xl text-sm transition">
            🧾 Voir la facture
          </a>
          <Link href="/commandes" className="flex-1 text-center bg-rose-800 hover:bg-rose-900 text-white font-bold py-3 rounded-xl text-sm transition">
            ← Mes commandes
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
