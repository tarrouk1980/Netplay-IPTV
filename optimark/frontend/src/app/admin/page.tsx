"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée" };
const STATUS_COLORS: Record<string, string> = { PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-blue-100 text-blue-800", SHIPPED: "bg-purple-100 text-purple-800", DELIVERED: "bg-green-100 text-green-800", CANCELLED: "bg-rose-100 text-rose-800" };
const ALL_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

type Tab = "stats" | "users" | "orders" | "products";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
    loadStats();
  }, [user, loading]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    if (tab === "stats") loadStats();
    else if (tab === "users") loadUsers();
    else if (tab === "orders") loadOrders();
    else if (tab === "products") loadProducts();
  }, [tab]);

  const loadStats = async () => {
    setFetching(true);
    const res = await api.get("/admin/stats").catch(() => null);
    setStats(res?.data?.data);
    setFetching(false);
  };

  const loadUsers = async () => {
    setFetching(true);
    const res = await api.get("/admin/users?limit=50").catch(() => null);
    setUsers(res?.data?.data || []);
    setFetching(false);
  };

  const loadOrders = async () => {
    setFetching(true);
    const res = await api.get("/admin/orders?limit=50").catch(() => null);
    setOrders(res?.data?.data || []);
    setFetching(false);
  };

  const loadProducts = async () => {
    setFetching(true);
    const res = await api.get("/admin/products?limit=50").catch(() => null);
    setProducts(res?.data?.data || []);
    setFetching(false);
  };

  const updateUserRole = async (userId: string, role: string) => {
    await api.patch(`/admin/users/${userId}/role`, { role }).catch(() => {});
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const toggleVerified = async (userId: string) => {
    const res = await api.patch(`/admin/users/${userId}/verify`).catch(() => null);
    if (res?.data?.data) setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: res.data.data.isVerified } : u));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await api.patch(`/admin/orders/${orderId}/status`, { status }).catch(() => {});
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const toggleProduct = async (productId: string) => {
    const res = await api.patch(`/admin/products/${productId}/toggle`).catch(() => null);
    if (res?.data?.data) setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: res.data.data.isActive } : p));
  };

  if (loading || !user) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "stats", label: "Vue d'ensemble", icon: "📊" },
    { key: "users", label: "Utilisateurs", icon: "👥" },
    { key: "orders", label: "Commandes", icon: "📦" },
    { key: "products", label: "Produits", icon: "🏪" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Panneau Admin</h1>
            <p className="text-slate-500 text-sm">OPTIMARK — Gestion de la plateforme</p>
          </div>
          <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full">ADMIN</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? "bg-rose-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {fetching && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton rounded-xl h-24"/>)}</div>}

        {/* Stats */}
        {tab === "stats" && stats && !fetching && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Utilisateurs", value: stats.totalUsers, icon: "👥", color: "text-slate-800" },
              { label: "Vendeurs", value: stats.totalSellers, icon: "🏪", color: "text-blue-700" },
              { label: "Produits", value: stats.totalProducts, icon: "📦", color: "text-slate-800" },
              { label: "Commandes", value: stats.totalOrders, icon: "🛒", color: "text-slate-800" },
              { label: "En attente", value: stats.pendingOrders, icon: "⏳", color: "text-amber-600" },
              { label: "Revenu total", value: `${Number(stats.totalRevenue).toFixed(2)} TND`, icon: "💰", color: "text-rose-800" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-xl p-5 border border-slate-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <p className="text-slate-500 text-xs mb-1">{icon} {label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === "users" && !fetching && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Nom", "Email", "Rôle", "Vérifié", "Inscrit le", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-800">{u.name}</td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)}
                          className="text-xs font-bold bg-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer">
                          <option value="BUYER">Acheteur</option>
                          <option value="SELLER">Vendeur</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleVerified(u.id)}
                          className={`text-xs font-bold px-2 py-1 rounded-full ${u.isVerified ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {u.isVerified ? "✓ Vérifié" : "Non vérifié"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs font-mono">{u.id.slice(0, 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && !fetching && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Commande", "Client", "Montant", "Statut", "Date", "Facture"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">#{o.id?.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-slate-700">{o.buyer?.name}</td>
                      <td className="px-5 py-3 font-black text-rose-800">{Number(o.total).toFixed(2)} TND</td>
                      <td className="px-5 py-3">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[o.status] || "bg-slate-100"}`}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-5 py-3">
                        <a href={`/commandes/${o.id}/facture`} target="_blank"
                          className="text-xs text-rose-800 font-semibold hover:underline">🧾 Voir</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === "products" && !fetching && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Titre", "Vendeur", "Prix", "Stock", "Statut", "Action"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800 max-w-[200px] truncate">{p.title}</td>
                      <td className="px-5 py-3 text-slate-500">{p.seller?.name}</td>
                      <td className="px-5 py-3 font-semibold text-rose-800">{Number(p.promoPrice || p.price).toFixed(2)} TND</td>
                      <td className="px-5 py-3 text-slate-600">{p.stock}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleProduct(p.id)}
                          className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {p.isActive ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-slate-400">{p.id.slice(0, 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
