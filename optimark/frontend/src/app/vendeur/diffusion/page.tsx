"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TEMPLATES = [
  { icon: "🎉", label: "Nouvelle collection", text: "🎉 Découvrez notre nouvelle collection ! Des produits exclusifs vous attendent dans notre boutique." },
  { icon: "⚡", label: "Vente flash", text: "⚡ VENTE FLASH aujourd'hui seulement ! Profitez de remises exceptionnelles sur une sélection de produits." },
  { icon: "🎁", label: "Promotion spéciale", text: "🎁 Offre spéciale pour nos abonnés ! Utilisez le code FIDELITE pour bénéficier de 10% de réduction." },
  { icon: "🏆", label: "Merci", text: "🙏 Merci pour votre fidélité ! Grâce à vous, notre boutique grandit chaque jour. Restez connectés pour de belles surprises !" },
  { icon: "📦", label: "Nouveau produit", text: "📦 Nouveau produit disponible ! Venez découvrir notre dernière exclusivité avant tout le monde." },
];

export default function VendeurDiffusionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [followers, setFollowers] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    api.get("/vendors/store-visits").then(r => setFollowers(r.data?.data?.followers ?? null)).catch(() => {});
  }, [user, loading, router]);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.post("/vendors/broadcast", { message });
      setResult({ ok: true, text: res.data?.message || `Message envoyé à vos abonnés !` });
      setMessage("");
    } catch (e: any) {
      setResult({ ok: false, text: e.response?.data?.message || "Erreur lors de l'envoi." });
    } finally {
      setSending(false);
    }
  };

  if (loading) return null;

  const remaining = 280 - message.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900">📢 Diffusion aux abonnés</h1>
        </div>

        {/* Audience */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 flex items-center gap-4"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <span className="text-3xl">👥</span>
          <div>
            <p className="font-black text-slate-900 text-lg">{followers ?? "—"} abonné(s)</p>
            <p className="text-slate-500 text-sm">Votre message sera envoyé à tous vos abonnés sous forme de notification.</p>
          </div>
        </div>

        {/* Composer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h2 className="font-black text-slate-800 mb-4">Composer votre message</h2>

          {/* Templates */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 mb-2">Modèles rapides :</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setMessage(t.text)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-rose-50 hover:text-rose-800 text-slate-600 px-3 py-1.5 rounded-xl transition">
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 280))}
            rows={5}
            placeholder="Rédigez votre message pour vos abonnés..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none mb-2"
          />

          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold ${remaining < 20 ? "text-amber-500" : "text-slate-400"}`}>
              {remaining} caractères restants
            </p>
            {message && (
              <button onClick={() => setMessage("")} className="text-xs text-slate-400 hover:text-red-500">
                Effacer
              </button>
            )}
          </div>

          {/* Preview */}
          {message && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
              <p className="text-xs font-bold text-slate-400 mb-1">Aperçu de la notification :</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-800 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "V"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{user?.name || "Votre boutique"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{message.slice(0, 80)}{message.length > 80 ? "..." : ""}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-semibold ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {result.ok ? "✓ " : "✗ "}{result.text}
            </div>
          )}

          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="w-full bg-rose-800 hover:bg-rose-900 text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-50"
          >
            {sending ? "Envoi en cours..." : `📤 Envoyer à ${followers ?? "vos"} abonné(s)`}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-2">💡 Conseils pour une bonne diffusion</h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• Soyez <strong>concis et percutant</strong> — les abonnés voient juste les premières lignes</li>
            <li>• Incluez un <strong>appel à l'action</strong> clair (ex: "Visitez notre boutique maintenant !")</li>
            <li>• Évitez les envois trop fréquents pour ne pas lasser vos abonnés</li>
            <li>• Les <strong>émojis</strong> augmentent le taux d'ouverture de +20%</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
