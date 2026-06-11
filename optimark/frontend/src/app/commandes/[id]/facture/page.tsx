"use client";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { use, useEffect, useState } from "react";

export default function FacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    api.get(`/orders/${id}/invoice`)
      .then(res => setOrder(res.data?.data))
      .catch(() => setOrder(null))
      .finally(() => setFetching(false));
  }, [user, loading, id]);

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-500">Chargement de la facture...</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-500">Facture introuvable.</p>
    </div>
  );

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(order.createdAt);
  const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const tva = subtotal * 0.19;
  const total = order.total;

  const PAYMENT_LABELS: Record<string, string> = {
    CASH_ON_DELIVERY: "Paiement à la livraison",
    KONNECT: "Konnect",
    PAYMEE: "Paymee",
    CARD: "Carte bancaire",
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        @page { margin: 20mm; }
      `}</style>

      {/* Print button */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => window.print()}
          className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-rose-900 transition">
          🖨️ Imprimer / PDF
        </button>
        <button onClick={() => window.history.back()}
          className="bg-white border border-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
          ← Retour
        </button>
      </div>

      <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 pb-6 border-b-2 border-slate-100">
          <div>
            <div className="text-3xl font-black mb-1">
              <span className="text-rose-800">OPTI</span><span className="text-slate-900">MARK</span>
            </div>
            <p className="text-slate-500 text-sm">Marketplace Tunisien</p>
            <p className="text-slate-500 text-sm">Tunis, Tunisie</p>
            <p className="text-slate-500 text-sm">contact@optimark.tn</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 mb-1">FACTURE</h1>
            <p className="text-rose-800 font-bold text-lg">{invoiceNumber}</p>
            <p className="text-slate-500 text-sm mt-1">
              Date : {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
              order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
              order.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}>
              {{ PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée" }[order.status as string] || order.status}
            </span>
          </div>
        </div>

        {/* Client info */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Facturé à</p>
            <p className="font-bold text-slate-900">{order.buyer?.name}</p>
            <p className="text-slate-600 text-sm">{order.buyer?.email}</p>
            {order.buyer?.phone && <p className="text-slate-600 text-sm">{order.buyer.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Paiement</p>
            <p className="font-bold text-slate-900">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
            <p className="text-slate-600 text-sm">Réf. commande : #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-slate-900 text-white text-sm">
              <th className="text-left px-4 py-3 rounded-tl-lg">Produit</th>
              <th className="text-left px-4 py-3">Vendeur</th>
              <th className="text-center px-4 py-3">Qté</th>
              <th className="text-right px-4 py-3">P.U.</th>
              <th className="text-right px-4 py-3 rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, i: number) => (
              <tr key={item.id} className={`text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                <td className="px-4 py-3 text-slate-800 font-medium">{item.product?.title}</td>
                <td className="px-4 py-3 text-slate-500">{item.product?.seller?.name || "—"}</td>
                <td className="px-4 py-3 text-center text-slate-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-700">{Number(item.price).toFixed(2)} TND</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">{(item.price * item.quantity).toFixed(2)} TND</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Sous-total HT</span>
              <span>{(subtotal / 1.19).toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>TVA (19%)</span>
              <span>{(tva / 1.19).toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Frais de livraison</span>
              <span className="text-green-600 font-semibold">Gratuit</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-black text-lg text-slate-900">
              <span>Total TTC</span>
              <span className="text-rose-800">{Number(total).toFixed(2)} TND</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-xs space-y-1">
          <p>Merci pour votre confiance — OPTIMARK, la marketplace tunisienne de référence.</p>
          <p>Cette facture a été générée automatiquement et est valable sans signature.</p>
          <p>Pour toute réclamation : contact@optimark.tn</p>
        </div>
      </div>
    </>
  );
}
