"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  ORDER:         { icon: "📦", color: "bg-blue-50 border-blue-100",   label: "Commande" },
  ORDER_PLACED:  { icon: "📦", color: "bg-blue-50 border-blue-100",   label: "Commande" },
  ORDER_STATUS:  { icon: "🔄", color: "bg-purple-50 border-purple-100", label: "Statut" },
  PAYMENT:       { icon: "💳", color: "bg-green-50 border-green-100", label: "Paiement" },
  MESSAGE:       { icon: "💬", color: "bg-cyan-50 border-cyan-100",   label: "Message" },
  PROMO:         { icon: "🏷️", color: "bg-amber-50 border-amber-100", label: "Promo" },
  RETURN:        { icon: "↩️", color: "bg-orange-50 border-orange-100", label: "Retour" },
  REVIEW:        { icon: "⭐", color: "bg-yellow-50 border-yellow-100", label: "Avis" },
  STOCK:         { icon: "⚠️", color: "bg-red-50 border-red-100",     label: "Stock" },
  SYSTEM:        { icon: "🔔", color: "bg-slate-50 border-slate-100", label: "Système" },
};

const ALL_TYPES = ["Tous", ...Object.values(TYPE_META).map(m => m.label).filter((v, i, a) => a.indexOf(v) === i)];

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/notifications"); return; }
    api.get("/notifications")
      .then(res => setNotifications(res.data?.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all").catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getMeta = (type: string) => TYPE_META[type] || TYPE_META.SYSTEM;
  const unread = notifications.filter(n => !n.isRead).length;

  const filtered = filter === "Tous"
    ? notifications
    : notifications.filter(n => getMeta(n.type).label === filter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
            {unread > 0 && (
              <p className="text-rose-700 text-sm font-medium mt-0.5">
                {unread} non lue{unread > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-rose-700 font-semibold text-sm hover:underline px-4 py-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition">
                Tout marquer lu
              </button>
            )}
            <Link href="/notifications/preferences" className="text-slate-500 font-semibold text-sm px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
              ⚙️ Préférences
            </Link>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_TYPES.map(type => (
            <button key={type} onClick={() => setFilter(type)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                filter === type ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}>
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">🔔</span>
            <p className="text-xl font-bold text-slate-700 mb-1">
              {filter === "Tous" ? "Aucune notification" : `Aucune notification "${filter}"`}
            </p>
            <p className="text-slate-400 text-sm">Vos notifications apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n: any) => {
              const meta = getMeta(n.type);
              return (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`w-full text-left bg-white border rounded-2xl p-4 flex items-start gap-4 transition hover:shadow-sm ${
                    n.isRead ? "border-slate-100 opacity-75" : `${meta.color} shadow-sm`
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? "bg-slate-100" : "bg-white"}`}>
                    <span className="text-xl">{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${n.isRead ? "text-slate-500" : "text-slate-900 font-semibold"}`}>
                      {n.message}
                    </p>
                    <p className="text-slate-400 text-xs mt-1.5">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2.5 h-2.5 bg-rose-600 rounded-full shrink-0 mt-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
