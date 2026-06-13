"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const AMOUNTS = [10, 20, 50, 100, 200];

export default function CartesCadeauxPage() {
  const [myCards, setMyCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [purchased, setPurchased] = useState<any>(null);
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.get("/gift-cards/my")
      .then(r => setMyCards(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const buy = async (amount: number) => {
    setPurchasing(amount);
    try {
      const res = await api.post("/gift-cards/purchase", { amount });
      const card = res.data.data;
      setPurchased(card);
      setMyCards(prev => [card, ...prev]);
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur");
    } finally {
      setPurchasing(null);
    }
  };

  const check = async () => {
    if (!checkCode.trim()) return;
    setChecking(true);
    try {
      const res = await api.post("/gift-cards/validate", { code: checkCode.trim().toUpperCase() });
      setCheckResult(res.data.data);
    } catch (e: any) {
      setCheckResult({ error: e.response?.data?.message || "Code invalide" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">🎁 Cartes cadeaux</h1>
        <p className="text-slate-500 text-sm mb-8">Offrez le plaisir du shopping sur OPTIMARK</p>

        {purchased && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <p className="font-black text-green-800 text-lg mb-1">🎉 Carte cadeau créée !</p>
            <p className="text-green-700 text-sm mb-3">Partagez ce code avec votre proche :</p>
            <div className="bg-white rounded-xl border border-green-200 px-6 py-4 inline-block">
              <p className="font-mono text-2xl font-black text-slate-900 tracking-widest">{purchased.code}</p>
              <p className="text-green-600 font-bold mt-1">Valeur : {purchased.amount} TND</p>
            </div>
            <p className="text-green-600 text-xs mt-3">Valable 1 an • Utilisable à la caisse</p>
            <button onClick={() => setPurchased(null)} className="mt-4 text-sm text-green-700 hover:underline block">Fermer</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Buy a gift card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Acheter une carte cadeau</h2>
            <div className="grid grid-cols-3 gap-3">
              {AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => buy(amount)}
                  disabled={!!purchasing}
                  className="border-2 border-slate-200 hover:border-rose-400 hover:bg-rose-50 rounded-xl py-4 font-black text-slate-800 transition disabled:opacity-50"
                >
                  {purchasing === amount ? "..." : `${amount} TND`}
                </button>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-4">Le code vous sera remis immédiatement après l&apos;achat.</p>
          </div>

          {/* Check a code */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 className="font-black text-slate-800 mb-4">Vérifier un code</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={checkCode}
                onChange={e => { setCheckCode(e.target.value); setCheckResult(null); }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-rose-100"
              />
              <button onClick={check} disabled={checking || !checkCode.trim()} className="bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-slate-900 transition disabled:opacity-50">
                {checking ? "..." : "Vérifier"}
              </button>
            </div>
            {checkResult && (
              checkResult.error ? (
                <p className="text-rose-600 text-sm font-semibold">{checkResult.error}</p>
              ) : (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-green-700 font-black">✓ Code valide</p>
                  <p className="text-green-600 text-sm mt-1">Solde disponible : <strong>{Number(checkResult.balance).toFixed(2)} TND</strong></p>
                </div>
              )
            )}
          </div>
        </div>

        {/* My gift cards */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">Mes cartes cadeaux</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
          ) : myCards.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">🎁</p>
              <p>Aucune carte cadeau achetée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Code", "Valeur", "Solde", "Statut", "Expire le"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myCards.map(c => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{c.code}</td>
                      <td className="px-5 py-3 font-black text-slate-800">{c.amount} TND</td>
                      <td className="px-5 py-3 font-bold text-green-700">{Number(c.balance).toFixed(2)} TND</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          {c.isActive ? "Actif" : "Épuisé"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("fr-FR") : "—"}</td>
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
