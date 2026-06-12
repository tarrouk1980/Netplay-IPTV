"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  ADMIN: "Administrateur",
};

export default function ComptePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<any>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/auth/connexion?redirect=/compte");
    else api.get("/returns/loyalty").then(r => setLoyalty(r.data?.data)).catch(() => {});
  }, [user, loading, router]);

  const redeem = async () => {
    if (!loyalty || loyalty.points < 100) return;
    setRedeeming(true);
    try {
      const res = await api.post("/returns/loyalty/redeem", { points: 100 });
      alert(`✓ 100 points échangés = ${res.data?.data?.discountTND} TND de réduction sur votre prochaine commande.`);
      api.get("/returns/loyalty").then(r => setLoyalty(r.data?.data)).catch(() => {});
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          <div className="skeleton rounded-2xl h-48" />
        </main>
        <Footer />
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Mon compte</h1>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-rose-800 text-white flex items-center justify-center text-2xl font-black shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{user.name}</p>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 mt-1">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Adresse e-mail</dt>
              <dd className="font-semibold text-slate-800">{user.email}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Téléphone</dt>
              <dd className="font-semibold text-slate-800">{user.phone || "Non renseigné"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Statut de vérification</dt>
              <dd className={`font-semibold ${user.isVerified ? "text-green-600" : "text-amber-600"}`}>
                {user.isVerified ? "Vérifié" : "En attente de vérification"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/commandes"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="font-bold text-slate-800">Mes commandes</p>
              <p className="text-slate-500 text-xs">Suivez vos achats et leur livraison</p>
            </div>
          </Link>

          <Link
            href="/favoris"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">♥</span>
            <div>
              <p className="font-bold text-slate-800">Mes favoris</p>
              <p className="text-slate-500 text-xs">Vos produits sauvegardés</p>
            </div>
          </Link>

          <Link
            href="/notifications"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🔔</span>
            <div>
              <p className="font-bold text-slate-800">Notifications</p>
              <p className="text-slate-500 text-xs">Commandes et mises à jour</p>
            </div>
          </Link>

          <Link
            href="/commandes?tab=returns"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">↩️</span>
            <div>
              <p className="font-bold text-slate-800">Mes retours</p>
              <p className="text-slate-500 text-xs">Demandes de retour et remboursements</p>
            </div>
          </Link>

          {user.role === "SELLER" && (
            <Link
              href="/vendeur/dashboard"
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <span className="text-3xl">🏪</span>
              <div>
                <p className="font-bold text-slate-800">Tableau de bord vendeur</p>
                <p className="text-slate-500 text-xs">Gérez vos produits et ventes</p>
              </div>
            </Link>
          )}
        </div>

        {/* Loyalty */}
        {loyalty && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="font-black text-amber-800 text-lg">{loyalty.points} points fidélité</p>
                  <p className="text-amber-600 text-xs">≈ {loyalty.valueInTND} TND · 1 point par TND dépensé</p>
                </div>
              </div>
              {loyalty.points >= 100 && (
                <button onClick={redeem} disabled={redeeming}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                  {redeeming ? "..." : "Échanger 100 pts"}
                </button>
              )}
            </div>
            {loyalty.points < 100 && (
              <p className="text-amber-600 text-xs mt-2">Il vous faut {100 - loyalty.points} points de plus pour échanger.</p>
            )}
          </div>
        )}

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="text-rose-700 font-semibold text-sm hover:underline"
        >
          Se déconnecter
        </button>
      </main>

      <Footer />
    </div>
  );
}
