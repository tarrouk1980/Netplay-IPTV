"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "En attente",  color: "#d97706", bg: "#fef3c7" },
  CONFIRMED:  { label: "Confirmée",   color: "#2563eb", bg: "#dbeafe" },
  SHIPPED:    { label: "Expédiée",    color: "#7c3aed", bg: "#ede9fe" },
  DELIVERED:  { label: "Livrée",      color: "#16a34a", bg: "#dcfce7" },
  CANCELLED:  { label: "Annulée",     color: "#dc2626", bg: "#fee2e2" },
};

export default function TableauDeBordPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders/my"),
      api.get("/loyalty/balance").catch(() => null),
      api.get("/notifications?limit=5").catch(() => null),
    ]).then(([o, l, n]) => {
      setOrders(o.data?.data || []);
      setLoyalty(l?.data?.data || null);
      setNotifications(n?.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const totalSpent = orders
    .filter(o => o.status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">🏠 Tableau de bord</h1>
          <p className="text-slate-500 text-sm">Votre activité sur OPTIMARK en un coup d'œil.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: "📦", label: "Commandes", value: orders.length, href: "/commandes" },
                { icon: "✅", label: "Livrées", value: statusCounts["DELIVERED"] || 0, href: "/commandes" },
                { icon: "💸", label: "Total dépensé", value: `${totalSpent.toFixed(2)} TND`, href: "/commandes" },
                { icon: "⭐", label: "Points fidélité", value: loyalty?.points ?? 0, href: "/loyalte" },
              ].map(k => (
                <Link key={k.label} href={k.href}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div className="text-2xl mb-2">{k.icon}</div>
                  <div className="text-xl font-black text-slate-900">{k.value}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">{k.label}</div>
                </Link>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Recent orders */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-slate-800">Commandes récentes</h2>
                  <Link href="/commandes" className="text-rose-800 text-sm font-bold hover:underline">Voir tout →</Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm">Aucune commande pour le moment</p>
                    <Link href="/" className="mt-3 inline-block text-rose-800 text-sm font-bold hover:underline">
                      Commencer à acheter →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map(o => {
                      const st = STATUS_LABELS[o.status] || { label: o.status, color: "#64748b", bg: "#f8fafc" };
                      return (
                        <Link key={o.id} href={`/commandes/${o.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-lg">📦</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">
                              Commande #{o.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString("fr-FR")} · {o.items?.length ?? 0} article(s)
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-black text-slate-800 text-sm">{Number(o.total).toFixed(2)} TND</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: st.color, backgroundColor: st.bg }}>
                              {st.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="space-y-4">
                {/* Loyalty card */}
                {loyalty && (
                  <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="font-black text-amber-900">{loyalty.points} points</p>
                        <p className="text-xs text-amber-700">≈ {loyalty.equivalentTND} TND</p>
                      </div>
                    </div>
                    <Link href="/loyalte" className="block text-center bg-amber-500 text-white font-bold text-sm py-2 rounded-xl hover:bg-amber-600 transition">
                      Gérer mes points →
                    </Link>
                  </div>
                )}

                {/* Status breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <h3 className="font-black text-slate-800 mb-3 text-sm">Statut des commandes</h3>
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const st = STATUS_LABELS[status] || { label: status, color: "#64748b", bg: "#f8fafc" };
                    const pct = Math.round((count / orders.length) * 100);
                    return (
                      <div key={status} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold" style={{ color: st.color }}>{st.label}</span>
                          <span className="text-slate-400">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: st.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick links */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <h3 className="font-black text-slate-800 mb-3 text-sm">Accès rapide</h3>
                  <div className="space-y-2">
                    {[
                      { href: "/favoris", label: "❤️ Mes favoris" },
                      { href: "/parrainage", label: "🤝 Parrainage" },
                      { href: "/alertes-prix", label: "🔔 Alertes de prix" },
                      { href: "/recemment-vus", label: "🕐 Récemment vus" },
                      { href: "/cartes-cadeaux", label: "🎁 Cartes cadeaux" },
                    ].map(l => (
                      <Link key={l.href} href={l.href}
                        className="block text-sm text-slate-600 hover:text-rose-800 font-medium hover:underline transition">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
