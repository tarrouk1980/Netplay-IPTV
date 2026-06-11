"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  ADMIN: "Administrateur",
};

export default function ComptePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/auth/connexion?redirect=/compte");
  }, [user, loading, router]);

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
