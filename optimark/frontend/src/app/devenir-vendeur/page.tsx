"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PERKS = [
  { icon: "🏪", title: "Votre boutique", desc: "Créez votre page boutique avec logo, description et tous vos produits." },
  { icon: "📦", title: "Gestion produits", desc: "Ajoutez des produits illimités avec photos, prix promo, stock et badges." },
  { icon: "🔴", title: "Live commerce", desc: "Vendez en direct avec le système de live intégré d'OPTIMARK." },
  { icon: "📊", title: "Tableau de bord", desc: "Suivez vos ventes, revenus et commandes en temps réel." },
  { icon: "💳", title: "Paiements sécurisés", desc: "Konnect, Paymee ou paiement à la livraison — vous choisissez." },
  { icon: "🏆", title: "Badge Vérifié", desc: "Obtenez le badge vendeur vérifié pour inspirer confiance." },
];

export default function DevenirVendeurPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!user) { router.push("/auth/inscription?role=SELLER"); return; }
    if (user.role === "SELLER") { router.push("/vendeur/dashboard"); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.patch("/auth/upgrade-to-seller");
      setDone(true);
      // Refresh user in localStorage
      const me = await api.get("/auth/me");
      if (me.data?.data) {
        localStorage.setItem("user", JSON.stringify(me.data.data));
        window.location.href = "/vendeur/dashboard";
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la mise à niveau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-800 to-rose-950 text-white py-20 px-4 text-center">
        <p className="text-rose-300 font-semibold text-sm mb-3 uppercase tracking-widest">Rejoignez OPTIMARK</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Vendez sur la marketplace<br/>tunisienne #1</h1>
        <p className="text-rose-100 text-lg max-w-xl mx-auto mb-8">
          Atteignez des milliers d&apos;acheteurs tunisiens. Créez votre boutique en 2 minutes.
        </p>
        {!loading && (
          user?.role === "SELLER" ? (
            <Link href="/vendeur/dashboard" className="inline-block bg-white text-rose-800 font-black px-8 py-3.5 rounded-2xl text-base hover:bg-rose-50 transition shadow-lg">
              Accéder à mon tableau de bord →
            </Link>
          ) : (
            <button onClick={handleUpgrade} disabled={submitting}
              className="inline-block bg-white text-rose-800 font-black px-8 py-3.5 rounded-2xl text-base hover:bg-rose-50 transition shadow-lg disabled:opacity-60">
              {submitting ? "En cours..." : user ? "Devenir vendeur maintenant" : "Créer un compte vendeur"}
            </button>
          )
        )}
        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
        {done && <p className="text-green-300 text-sm mt-3">✓ Compte mis à niveau ! Redirection...</p>}
      </section>

      {/* Avantages */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Tout ce qu&apos;il vous faut pour vendre</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {PERKS.map(p => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-slate-100" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-black text-slate-900 mb-1">{p.title}</h3>
                <p className="text-slate-500 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-10">Lancez-vous en 3 étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Créez votre compte", desc: "Inscription gratuite en 1 minute." },
              { step: "2", title: "Configurez votre boutique", desc: "Ajoutez logo, description et vos premiers produits." },
              { step: "3", title: "Commencez à vendre", desc: "Recevez vos premières commandes et gérez tout depuis votre tableau de bord." },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-rose-800 text-white font-black text-xl flex items-center justify-center mb-3 shadow-md shadow-rose-200">{s.step}</div>
                <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            {!loading && (user?.role === "SELLER" ? (
              <Link href="/vendeur/dashboard" className="inline-block bg-rose-800 text-white font-black px-10 py-4 rounded-2xl text-base hover:bg-rose-900 transition shadow-lg shadow-rose-200">
                Mon tableau de bord →
              </Link>
            ) : (
              <button onClick={handleUpgrade} disabled={submitting}
                className="bg-rose-800 text-white font-black px-10 py-4 rounded-2xl text-base hover:bg-rose-900 transition shadow-lg shadow-rose-200 disabled:opacity-60">
                {submitting ? "En cours..." : user ? "Devenir vendeur" : "S'inscrire comme vendeur"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
