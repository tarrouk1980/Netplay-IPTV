"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoyaltePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<any>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth/connexion?redirect=/loyalte"); return; }
    api.get("/loyalty/balance").then(r => setBalance(r.data?.data)).catch(() => {});
  }, [user, loading, router]);

  const redeem = async () => {
    const points = parseInt(pointsInput, 10);
    if (!points || points < 100) { setError("Minimum 100 points à échanger."); return; }
    setError("");
    setRedeeming(true);
    try {
      const res = await api.post("/loyalty/redeem", { points });
      setRedeemResult(res.data?.data);
      setBalance((b: any) => b ? { ...b, points: res.data?.data?.remainingPoints, equivalentTND: (res.data?.data?.remainingPoints * 0.01).toFixed(2) } : b);
      setPointsInput("");
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de l'échange.");
    } finally {
      setRedeeming(false);
    }
  };

  const points = balance?.points ?? 0;
  const maxPoints = points;
  const inputPoints = parseInt(pointsInput, 10) || 0;
  const discountPreview = (Math.min(inputPoints, maxPoints) * 0.01).toFixed(2);

  const TIERS = [
    { name: "Bronze", min: 0, max: 999, color: "#b45309", bg: "#fef3c7", icon: "🥉" },
    { name: "Argent", min: 1000, max: 4999, color: "#475569", bg: "#f1f5f9", icon: "🥈" },
    { name: "Or", min: 5000, max: 19999, color: "#b45309", bg: "#fef9ec", icon: "🥇" },
    { name: "Platine", min: 20000, max: Infinity, color: "#7c3aed", bg: "#f5f3ff", icon: "💎" },
  ];
  const currentTier = TIERS.findLast(t => points >= t.min) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier ? Math.min(100, ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-black text-slate-900 mb-2">🏆 Programme de fidélité</h1>
        <p className="text-slate-500 text-sm mb-8">Gagnez des points sur chaque commande livrée et échangez-les contre des réductions.</p>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-rose-800 to-rose-900 rounded-3xl p-8 text-white mb-8">
          <p className="text-rose-200 text-sm font-semibold mb-1">Votre solde</p>
          <p className="text-5xl font-black mb-1">{points.toLocaleString("fr-FR")}</p>
          <p className="text-rose-200 font-semibold mb-4">points</p>
          <div className="bg-rose-950 bg-opacity-40 rounded-xl px-4 py-2.5 inline-block">
            <p className="text-sm text-rose-100">Équivalent : <span className="font-black text-white">{balance?.equivalentTND || "0.00"} TND</span></p>
          </div>
        </div>

        {/* Tier card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{currentTier.icon}</span>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Votre niveau</p>
              <p className="text-xl font-black" style={{ color: currentTier.color }}>{currentTier.name}</p>
            </div>
          </div>
          {nextTier && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{points.toLocaleString("fr-FR")} pts</span>
                <span>{nextTier.min.toLocaleString("fr-FR")} pts → {nextTier.icon} {nextTier.name}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${tierProgress}%`, backgroundColor: currentTier.color }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{(nextTier.min - points).toLocaleString("fr-FR")} points pour atteindre {nextTier.name}</p>
            </>
          )}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {TIERS.map(t => (
              <div key={t.name} className="rounded-xl p-2 text-center" style={{ backgroundColor: t.bg }}>
                <p className="text-lg">{t.icon}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[9px] text-slate-400">{t.min >= 20000 ? "20 000+" : `${t.min === 0 ? "0" : t.min.toLocaleString("fr-FR")}${t.max !== Infinity ? "–" + t.max.toLocaleString("fr-FR") : "+"}`}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 className="font-black text-slate-900 mb-4">Comment ça marche ?</h2>
          <div className="space-y-3">
            {[
              { icon: "🛒", text: balance?.earnRate || "10 points par TND dépensé" },
              { icon: "🚚", text: "Points crédités quand la commande est livrée" },
              { icon: "🎁", text: balance?.redeemRate || "100 points = 1.00 TND de réduction" },
              { icon: "⚡", text: "Échange minimum : 100 points" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl shrink-0">{icon}</span>
                <p className="text-slate-600 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 className="font-black text-slate-900 mb-4">Échanger mes points</h2>

          {redeemResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-800">
              <p className="font-bold">✓ Échange effectué !</p>
              <p className="text-sm mt-1">{redeemResult.pointsUsed} points → <strong>{redeemResult.discountTND} TND</strong> de réduction.</p>
              <p className="text-sm mt-0.5 text-green-600">Il vous reste {redeemResult.remainingPoints} points.</p>
            </div>
          )}

          <div className="flex gap-3 mb-2">
            <input
              type="number"
              value={pointsInput}
              onChange={e => { setPointsInput(e.target.value); setError(""); setRedeemResult(null); }}
              placeholder="Ex: 500"
              min={100}
              max={maxPoints}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-100"
            />
            <button
              onClick={redeem}
              disabled={redeeming || points < 100}
              className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 rounded-xl transition disabled:opacity-50"
            >
              {redeeming ? "..." : "Échanger"}
            </button>
          </div>

          {inputPoints >= 100 && inputPoints <= maxPoints && (
            <p className="text-sm text-rose-700 font-semibold">→ Vous obtiendrez <strong>{discountPreview} TND</strong> de réduction.</p>
          )}
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          {points < 100 && <p className="text-slate-400 text-xs mt-2">Vous avez besoin d'au moins 100 points pour échanger.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
