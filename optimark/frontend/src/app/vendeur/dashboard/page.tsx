"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée" };
const STATUS_COLORS: Record<string, string> = { PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-blue-100 text-blue-800", SHIPPED: "bg-purple-100 text-purple-800", DELIVERED: "bg-green-100 text-green-800", CANCELLED: "bg-rose-100 text-rose-800" };
const ALL_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function VendeurDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [visits, setVisits] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    Promise.all([
      api.get("/vendors/dashboard"),
      api.get("/vendors/orders"),
      api.get("/vendors/store-visits").catch(() => null),
    ]).then(([d, o, v]) => {
      setStats(d.data.data);
      setOrders(o.data.data);
      setVisits(v?.data?.data || null);
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user, loading]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      await api.patch(`/vendors/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { alert("Erreur"); }
    finally { setUpdatingOrder(null); }
  };

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton rounded-xl h-24"/>)}</div>
      </main><Footer /></div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard Vendeur</h1>
            <p className="text-slate-500 text-sm mt-0.5">Bonjour, {user?.name}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/vendeur/boutique" className="px-4 py-2 border border-rose-300 text-rose-800 rounded-xl hover:bg-rose-50 text-sm font-semibold transition">🏪 Ma boutique</Link>
            <Link href="/vendeur/coupons" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">🏷️ Codes promo</Link>
            <Link href="/vendeur/flash-ventes" className="px-4 py-2 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 text-sm font-semibold transition">⚡ Ventes flash</Link>
            <Link href="/vendeur/retours" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">↩️ Retours</Link>
            <Link href="/vendeur/questions" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">❓ Questions</Link>
            <Link href="/vendeur/avis" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">⭐ Avis</Link>
            <Link href="/vendeur/revenus" className="px-4 py-2 border border-green-300 text-green-700 rounded-xl hover:bg-green-50 text-sm font-semibold transition">💰 Revenus</Link>
            <Link href="/vendeur/bundles" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">🎁 Bundles</Link>
            <Link href="/vendeur/virements" className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 text-sm font-semibold transition">💸 Virements</Link>
            <Link href="/vendeur/analytiques" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">📊 Analytiques</Link>
            <Link href="/vendeur/importer" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">📤 Importer CSV</Link>
            <Link href="/vendeur/abonnement" className="px-4 py-2 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 text-sm font-semibold transition">💎 Mon plan</Link>
            <Link href="/vendeur/inventaire" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">📦 Inventaire</Link>
            <Link href="/vendeur/services" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold transition">💼 Services</Link>
            <Link href="/vendeur/publicite" className="px-4 py-2 border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-50 text-sm font-semibold transition">📣 Publicité</Link>
            <Link href="/vendeur/performance" className="px-4 py-2 border border-green-200 text-green-700 rounded-xl hover:bg-green-50 text-sm font-semibold transition">📊 Mon score</Link>
            {!user?.isVerified && (
              <button onClick={() => api.patch("/vendors/verify")} className="px-4 py-2 border border-amber-400 text-amber-700 rounded-xl hover:bg-amber-50 text-sm font-medium transition">Demander vérification</button>
            )}
            <Link href="/vendeur/produits/nouveau" className="px-4 py-2 bg-rose-800 text-white rounded-xl hover:bg-rose-900 text-sm font-bold transition">+ Nouveau produit</Link>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Produits", value: stats.totalProducts, color: "text-slate-800" },
              { label: "Commandes", value: stats.totalOrders, color: "text-slate-800" },
              { label: "CA du mois", value: `${stats.monthRevenue.toFixed(2)} TND`, color: "text-rose-800" },
              { label: "Note moy.", value: stats.avgRating > 0 ? `${stats.avgRating}★` : "—", color: "text-amber-500" },
              { label: "Stock limité", value: stats.lowStockCount, color: stats.lowStockCount > 0 ? "text-orange-600" : "text-slate-400" },
              { label: "Épuisé", value: stats.outOfStockCount, color: stats.outOfStockCount > 0 ? "text-red-600" : "text-slate-400" },
              ...(visits ? [
                { label: "Vues boutique", value: visits.totalViews, color: "text-indigo-600" },
                { label: "Abonnés", value: visits.followers, color: "text-purple-600" },
              ] : []),
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl p-4 border border-slate-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <p className="text-slate-500 text-xs mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">Commandes reçues</h2>
            <Link href="/vendeur/produits" className="text-rose-800 text-sm font-semibold hover:underline">Voir mes produits →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400"><p className="text-4xl mb-3">📦</p><p>Aucune commande pour l&apos;instant</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Commande", "Client", "Montant", "Statut", "Date"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">#{order.id?.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-slate-700">{order.buyer?.name || "—"}</td>
                      <td className="px-5 py-4 font-black text-rose-800">{Number(order.total).toFixed(2)} TND</td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={updatingOrder === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
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
