"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "En attente",    color: "#d97706", bg: "#fef3c7" },
  APPROVED:  { label: "Approuvée",     color: "#16a34a", bg: "#dcfce7" },
  REJECTED:  { label: "Refusée",       color: "#dc2626", bg: "#fee2e2" },
  COMPLETED: { label: "Traitée",       color: "#2563eb", bg: "#dbeafe" },
};

export default function MesRetoursPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/returns/my"),
      api.get("/orders/my").catch(() => null),
    ]).then(([r, o]) => {
      setReturns(r.data?.data || []);
      const delivered = (o?.data?.data || []).filter((x: any) => x.status === "DELIVERED");
      setOrders(delivered);
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/returns", { orderId, reason });
      setReturns(prev => [res.data?.data, ...prev]);
      setSuccess(true);
      setShowForm(false);
      setOrderId("");
      setReason("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">↩️ Mes retours</h1>
            <p className="text-slate-500 text-sm">Gérez vos demandes de retour.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-rose-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition"
          >
            + Nouvelle demande
          </button>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
            ✓ Demande de retour soumise avec succès.
          </div>
        )}

        {/* Return request form */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-2xl border border-rose-200 p-5 mb-6"
            style={{ boxShadow: "0 2px 12px rgba(159,18,57,0.06)" }}>
            <h2 className="font-black text-slate-800 mb-4">Nouvelle demande de retour</h2>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Commande concernée</label>
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune commande livrée éligible au retour.</p>
              ) : (
                <select
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
                >
                  <option value="">Sélectionner une commande…</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.id.slice(-8).toUpperCase()} — {Number(o.total).toFixed(2)} TND — {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Raison du retour</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                rows={4}
                placeholder="Décrivez le problème (article défectueux, erreur de commande, etc.)..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting || !orderId}
                className="bg-rose-800 text-white font-black px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50">
                {submitting ? "Envoi..." : "Soumettre la demande"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-slate-500 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition">
                Annuler
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-4">↩️</div>
            <p className="font-semibold">Aucune demande de retour</p>
            <p className="text-sm mt-1">Vos demandes de retour apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map(r => {
              const st = STATUS[r.status] || { label: r.status, color: "#64748b", bg: "#f8fafc" };
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-slate-800">Demande #{r.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Soumise le {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ color: st.color, backgroundColor: st.bg }}>
                      {st.label}
                    </span>
                  </div>

                  {r.orderId && (
                    <Link href={`/commandes/${r.orderId}`}
                      className="text-xs text-rose-800 font-semibold hover:underline mb-2 block">
                      → Voir la commande #{r.orderId.slice(-8).toUpperCase()}
                    </Link>
                  )}

                  <div className="bg-slate-50 rounded-xl p-3 mt-2">
                    <p className="text-xs font-bold text-slate-500 mb-1">Raison</p>
                    <p className="text-sm text-slate-700">{r.reason}</p>
                  </div>

                  {r.sellerNote && (
                    <div className="bg-blue-50 rounded-xl p-3 mt-2 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 mb-1">Réponse du vendeur</p>
                      <p className="text-sm text-blue-800">{r.sellerNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
