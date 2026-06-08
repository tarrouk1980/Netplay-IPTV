"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-50 text-blue-700 border-blue-200" },
  SHIPPED: { label: "Expédiée", color: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED: { label: "Livrée", color: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Annulée", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function CommandesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justOrdered = searchParams.get("payment") === "success";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/connexion");
      return;
    }
    api.get("/orders/me")
      .then(res => setOrders(res.data?.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Mes commandes</h1>
        <p className="text-slate-500 text-sm mb-8">Suivez l&apos;état de vos commandes en temps réel</p>

        {justOrdered && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-green-800">Commande passée avec succès !</p>
              <p className="text-green-600 text-sm">Vous recevrez une confirmation par e-mail. Merci d&apos;avoir choisi OPTIMARK.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-28" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-xl font-bold text-slate-700 mb-1">Aucune commande pour le moment</p>
            <p className="text-slate-400 text-sm mb-5">Vos achats apparaîtront ici une fois passés.</p>
            <Link href="/produits" className="inline-block bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              return (
                <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-slate-800">Commande #{order.id?.slice(0, 8)}</p>
                      <p className="text-slate-400 text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <p className="text-slate-500 text-sm">{order.items?.length || 0} article(s)</p>
                    <p className="font-black text-rose-800">{Number(order.total || 0).toFixed(2)} TND</p>
                  </div>
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
