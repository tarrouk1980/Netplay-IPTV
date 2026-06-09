"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TYPE_ICONS: Record<string, string> = {
  ORDER_PLACED: "📦",
  ORDER_STATUS: "🔄",
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
            {unread > 0 && <p className="text-slate-500 text-sm">{unread} non lue{unread > 1 ? "s" : ""}</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-rose-700 font-semibold text-sm hover:underline">
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-16" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">🔔</span>
            <p className="text-xl font-bold text-slate-700 mb-1">Aucune notification</p>
            <p className="text-slate-400 text-sm">Vos notifications apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`w-full text-left bg-white border rounded-2xl p-4 flex items-start gap-4 transition ${
                  n.isRead ? "border-slate-100 opacity-70" : "border-rose-200 shadow-sm"
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "text-slate-600" : "text-slate-900 font-semibold"}`}>
                    {n.message}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-rose-800 rounded-full shrink-0 mt-2" />}
              </button>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
