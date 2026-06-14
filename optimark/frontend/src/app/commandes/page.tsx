"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { title: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:    { label: "En attente",  color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  CONFIRMED:  { label: "Confirmée",   color: "bg-blue-100 text-blue-700",     icon: "✅" },
  SHIPPED:    { label: "Expédiée",    color: "bg-purple-100 text-purple-700", icon: "🚚" },
  DELIVERED:  { label: "Livrée",      color: "bg-green-100 text-green-700",   icon: "📦" },
  CANCELLED:  { label: "Annulée",     color: "bg-red-100 text-red-700",       icon: "❌" },
};

const PAYMENT_LABELS: Record<string, string> = {
  KONNECT:          "Konnect 💳",
  PAYMEE:           "Paymee 💳",
  CASH_ON_DELIVERY: "Cash à la livraison 💵",
  CARD:             "Carte bancaire 💳",
};

function CommandesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/connexion");
      return;
    }
    api.get("/orders/me").then((res) => {
      setOrders(res.data.data || []);
    }).catch(() => {
      setOrders([]);
    }).finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Mes commandes</h1>
        <p className="text-slate-500 text-sm mb-6">Suivez l&apos;état de vos commandes</p>

        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">Paiement réussi !</p>
              <p className="text-green-600 text-sm">Votre commande a été passée avec succès.</p>
            </div>
          </div>
        )}
        {paymentStatus === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-semibold text-red-800">Paiement échoué</p>
              <p className="text-red-600 text-sm">Veuillez réessayer ou choisir un autre mode de paiement.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-4 animate-pulse">⏳</p>
            <p>Chargement de vos commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-xl font-medium text-slate-600">Aucune commande pour l&apos;instant</p>
            <button
              onClick={() => router.push("/produits")}
              className="mt-4 bg-blue-800 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
            >
              Découvrir les produits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700", icon: "❓" };
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <span className="text-lg font-extrabold text-blue-800">{order.total.toFixed(2)} TND</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.product?.title} <span className="text-slate-400">×{item.quantity}</span></span>
                        <span className="text-slate-600 font-medium">{(item.price * item.quantity).toFixed(2)} TND</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Paiement : {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                    </span>
                    {order.status === "PENDING" && (
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium transition">
                        Annuler
                      </button>
                    )}
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

export default function CommandesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Chargement...</div>}>
      <CommandesContent />
    </Suspense>
  );
}
