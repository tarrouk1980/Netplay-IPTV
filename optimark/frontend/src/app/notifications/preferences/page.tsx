"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const PREFS_CONFIG = [
  { key: "orders", label: "Mises à jour des commandes", desc: "Confirmations, expéditions, livraisons", icon: "📦" },
  { key: "messages", label: "Nouveaux messages", desc: "Quand vous recevez un message", icon: "💬" },
  { key: "promos", label: "Promotions et offres", desc: "Flash sales, codes promo, annonces des boutiques suivies", icon: "🎉" },
  { key: "priceAlerts", label: "Alertes de prix", desc: "Quand un produit atteint votre prix cible", icon: "🔔" },
  { key: "system", label: "Notifications système", desc: "Sécurité, mises à jour importantes", icon: "⚙️" },
];

export default function NotifPrefsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    orders: true, messages: true, promos: true, priceAlerts: true, system: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/notifications/preferences")
      .then(r => setPrefs(p => ({ ...p, ...(r.data?.data || {}) })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch("/notifications/preferences", prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/notifications" className="text-slate-400 hover:text-slate-600 text-sm">← Notifications</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-1">⚙️ Préférences de notifications</h1>
          </div>
          <button onClick={save} disabled={saving}
            className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50">
            {saving ? "Sauvegarde..." : saved ? "✓ Sauvegardé !" : "Sauvegarder"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {PREFS_CONFIG.map((pref, i) => (
            <div key={pref.key} className={`flex items-center justify-between px-6 py-5 ${i < PREFS_CONFIG.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{pref.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800">{pref.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{pref.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${prefs[pref.key] ? "bg-rose-800" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[pref.key] ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
