"use client";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  monthRevenue: number;
  avgRating: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  buyer: { name: string };
}

export default function VendeurDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "SELLER") {
        router.replace("/auth/connexion");
        return;
      }
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [dashRes, ordersRes] = await Promise.all([
        api.get("/vendors/dashboard"),
        api.get("/vendors/orders"),
      ]);
      setStats(dashRes.data.data);
      setOrders(ordersRes.data.data.slice(0, 5));
    } catch {
    } finally {
      setFetching(false);
    }
  };

  const handleVerify = async () => {
    try {
      await api.patch("/vendors/verify");
      alert("Demande de vérification envoyée !");
    } catch {
      alert("Erreur lors de la demande");
    }
  };

  const statusLabel: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Vendeur</h1>
            <p className="text-slate-500 mt-1">Bonjour, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            {!user?.isVerified && (
              <button
                onClick={handleVerify}
                className="px-4 py-2 border border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 text-sm font-medium transition"
              >
                Demander vérification
              </button>
            )}
            <button
              onClick={() => router.push("/vendeur/produits/nouveau")}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              + Ajouter un produit
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Produits actifs</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Commandes reçues</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">CA du mois (TND)</p>
              <p className="text-3xl font-bold text-blue-800">{stats.monthRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Note moyenne</p>
              <p className="text-3xl font-bold text-amber-500">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                {stats.avgRating > 0 && <span className="text-lg ml-1">★</span>}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Dernières commandes</h2>
            <button
              onClick={() => router.push("/vendeur/produits")}
              className="text-blue-800 text-sm hover:underline"
            >
              Voir mes produits
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune commande pour l'instant</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">ID commande</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Client</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Montant</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Statut</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-slate-700">{order.buyer?.name || "—"}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{order.total.toFixed(2)} TND</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.status] || "bg-slate-100 text-slate-600"}`}>
                          {statusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
