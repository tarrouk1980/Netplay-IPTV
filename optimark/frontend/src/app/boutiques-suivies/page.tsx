"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BoutiquesSuiviesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/boutiques-suivies"); return; }
    api.get("/vendors/following/my")
      .then(r => setSellers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const unfollow = async (sellerId: string) => {
    await api.post(`/vendors/${sellerId}/follow`).catch(() => {});
    setSellers(prev => prev.filter(s => s.sellerId !== sellerId));
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">🔔 Boutiques suivies</h1>
        <p className="text-slate-500 text-sm mb-6">Vous suivez {sellers.length} boutique{sellers.length !== 1 ? "s" : ""}.</p>

        {sellers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-bold text-slate-700 mb-2">Vous ne suivez aucune boutique</p>
            <p className="text-slate-400 text-sm mb-4">Suivez vos boutiques préférées pour ne manquer aucune offre.</p>
            <Link href="/boutiques" className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
              Découvrir des boutiques
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sellers.map(s => (
              <div key={s.sellerId} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-800 flex items-center justify-center text-white text-xl font-black overflow-hidden shrink-0">
                    {s.logo ? <img src={s.logo} alt={s.name} className="w-full h-full object-cover" /> : s.name?.charAt(0)?.toUpperCase() || "B"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{s.name}</p>
                    {s.description && <p className="text-slate-400 text-xs truncate">{s.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/boutique/${s.sellerId}`} className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 transition">
                    Voir la boutique
                  </Link>
                  <button onClick={() => unfollow(s.sellerId)} className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
                    Se désabonner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
