"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

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
  const { addItem } = useCart();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnSent, setReturnSent] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion"); return; }
    Promise.all([
      api.get(`/orders/${id}/invoice`).catch(() => null),
      api.get(`/orders/${id}`).catch(() => null),
    ]).then(([invoiceRes, orderRes]) => {
      const invoice = invoiceRes?.data?.data;
      const order = orderRes?.data?.data;
      setOrder(invoice ? { ...invoice, statusHistory: order?.statusHistory } : order);
    }).catch(() => setOrder(null)).finally(() => setLoading(false));
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

  const cancelOrder = async () => {
    if (!confirm("Annuler cette commande ?")) return;
    try {
      const res = await api.patch(`/orders/${order.id}/cancel`);
      setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));
    } catch (e: any) {
      alert(e.response?.data?.message || "Impossible d'annuler la commande.");
    }
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    setReturnLoading(true);
    try {
      await api.post("/returns", { orderId: order.id, reason: returnReason });
      setReturnSent(true);
      setShowReturnForm(false);
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur lors de la demande.");
    } finally {
      setReturnLoading(false);
    }
  };

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

        {/* Status history timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 className="font-black text-slate-900 mb-4">Historique du suivi</h2>
            <div className="space-y-0">
              {order.statusHistory.map((h: any, i: number) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-rose-800 mt-1 shrink-0" />
                    {i < order.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-slate-800">{STATUS[h.status]?.label || h.status}</p>
                    <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString("fr-FR", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })}</p>
                    {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
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

        {/* Cancel order */}
        {order.status === "PENDING" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-900 mb-2">❌ Annuler la commande</h2>
            <p className="text-slate-500 text-sm mb-3">Vous pouvez annuler cette commande tant qu&apos;elle est en attente de confirmation.</p>
            <button onClick={cancelOrder} className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-200 transition">
              Annuler la commande
            </button>
          </div>
        )}

        {/* Return request */}
        {order.status === "DELIVERED" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 className="font-black text-slate-900 mb-2">↩️ Demande de retour</h2>
            {returnSent ? (
              <p className="text-green-600 font-semibold text-sm">✓ Votre demande de retour a été envoyée. Nous vous contacterons sous 48h.</p>
            ) : showReturnForm ? (
              <form onSubmit={submitReturn} className="space-y-3">
                <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} required
                  placeholder="Décrivez la raison du retour (produit défectueux, non conforme, etc.)"
                  rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={returnLoading}
                    className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50">
                    {returnLoading ? "Envoi..." : "Envoyer la demande"}
                  </button>
                  <button type="button" onClick={() => setShowReturnForm(false)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold px-4">Annuler</button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-slate-500 text-sm mb-3">Vous avez 7 jours après la livraison pour demander un retour.</p>
                <button onClick={() => setShowReturnForm(true)} className="border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-800 font-semibold px-4 py-2 rounded-xl text-sm transition">
                  Demander un retour
                </button>
              </div>
            )}
          </div>
        )}

        {/* Points fidélité gagnés */}
        {order.status === "DELIVERED" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-bold text-amber-800">+{Math.floor(order.total)} points fidélité gagnés !</p>
              <p className="text-amber-600 text-xs">Utilisez vos points pour obtenir des réductions sur vos prochaines commandes.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <a href={`/commandes/${order.id}/facture`} target="_blank"
            className="flex-1 text-center bg-white border border-slate-200 hover:border-rose-300 text-slate-700 font-bold py-3 rounded-xl text-sm transition">
            🧾 Voir la facture
          </a>
          {order.status === "DELIVERED" && order.items?.length > 0 && (
            <button onClick={() => {
              order.items.forEach((item: any) => {
                if (item.product?.id) addItem({ id: item.product.id, title: item.product.title, price: item.product.promoPrice || item.product.price || item.price, seller: item.product.seller?.name || "", image: item.product.images?.[0] });
              });
            }} className="flex-1 text-center bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 font-bold py-3 rounded-xl text-sm transition">
              🔄 Commander à nouveau
            </button>
          )}
          <Link href="/commandes" className="flex-1 text-center bg-rose-800 hover:bg-rose-900 text-white font-bold py-3 rounded-xl text-sm transition">
            ← Mes commandes
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
