"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function ParrainagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/referral/my-code")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copy = () => {
    if (!data?.code) return;
    navigator.clipboard.writeText(data.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareText = data?.shareText || "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">🤝 Programme de parrainage</h1>
        <p className="text-slate-500 text-sm mb-8">Invitez vos amis et gagnez des points fidélité</p>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
        ) : !data ? (
          <p className="text-slate-400 text-center py-10">Connectez-vous pour accéder au programme de parrainage.</p>
        ) : (
          <>
            {/* Code card */}
            <div className="bg-gradient-to-br from-rose-800 to-rose-900 text-white rounded-2xl p-6 mb-6">
              <p className="text-rose-200 text-sm font-semibold mb-2">Votre code de parrainage</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black tracking-widest">{data.code}</span>
                <button onClick={copy} className="bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-xl text-sm font-bold">
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-rose-200 text-sm mt-4">{data.referredCount} ami(s) parrainé(s)</p>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <h2 className="font-black text-slate-800 mb-4">Comment ça marche ?</h2>
              <div className="space-y-4">
                {[
                  { step: "1", icon: "🔗", title: "Partagez votre code", desc: "Envoyez votre code à vos amis" },
                  { step: "2", icon: "👤", title: "Ils s'inscrivent", desc: "Vos amis créent un compte avec votre code" },
                  { step: "3", icon: "🛒", title: "Ils passent leur 1ère commande", desc: "Dès leur première commande validée..." },
                  { step: "4", icon: "🏆", title: "Vous gagnez 200 points !", desc: "200 points fidélité = 2 TND de réduction" },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{icon} {title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share text */}
            {shareText && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h2 className="font-black text-slate-800 mb-3">Message à partager</h2>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-line mb-4">{shareText}</div>
                <button
                  onClick={() => navigator.clipboard.writeText(shareText)}
                  className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-900 transition"
                >
                  Copier le message
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
