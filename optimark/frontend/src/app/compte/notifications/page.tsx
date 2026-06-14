"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const PREFS = [
  { key: "orders", label: "Commandes", desc: "Confirmations, livraisons, annulations", icon: "📦" },
  { key: "messages", label: "Messages", desc: "Nouveaux messages de vendeurs", icon: "💬" },
  { key: "promos", label: "Promotions", desc: "Ventes flash, codes promo, offres spéciales", icon: "🏷️" },
  { key: "priceAlerts", label: "Alertes de prix", desc: "Baisses de prix sur vos produits suivis", icon: "🔔" },
  { key: "system", label: "Système", desc: "Mises à jour, sécurité, maintenance", icon: "⚙️" },
];

export default function NotifPreferencesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    orders: true, messages: true, promos: true, priceAlerts: true, system: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/notifications/preferences")
      .then(r => { if (r.data?.data) setPrefs(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch("/notifications/preferences", prefs);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">⚙️ Préférences de notifications</h1>
          <p className="text-slate-500 text-sm">Choisissez les notifications que vous souhaitez recevoir.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 mb-6"
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            {PREFS.map(p => (
              <div key={p.key} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800">{p.label}</p>
                    <p className="text-sm text-slate-400">{p.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(p.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${prefs[p.key] ? "bg-rose-800" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[p.key] ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
            ✓ Préférences sauvegardées
          </div>
        )}

        <button
          onClick={save}
          disabled={saving || loading}
          className="w-full bg-rose-800 text-white font-black py-3.5 rounded-2xl hover:bg-rose-900 transition disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
        </button>
      </main>
      <Footer />
    </div>
  );
}
