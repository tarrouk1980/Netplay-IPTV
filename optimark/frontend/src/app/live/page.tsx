"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LiveCard from "@/components/LiveCard";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LivePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/live")
      .then((r) => r.json())
      .then((d) => setSessions(d.data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-crimson rounded-full animate-pulse inline-block"></span>
            <h1 className="text-3xl font-bold text-slate-800">Lives en cours</h1>
          </div>
          <Link href="/vendeur/live" className="bg-crimson text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-crimson-dark transition text-sm">
            Démarrer un live
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📹</p>
            <p className="text-slate-500 text-lg mb-2">Aucun live en cours</p>
            <p className="text-slate-400 text-sm mb-6">Soyez le premier à démarrer un live !</p>
            <Link href="/vendeur/live" className="bg-crimson text-white font-semibold px-6 py-3 rounded-xl hover:bg-crimson-dark transition">
              Démarrer un live
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sessions.map((s: any) => (
              <LiveCard
                key={s.id}
                id={s.id}
                title={s.title}
                vendorName={s.vendor?.name || "Vendeur"}
                viewerCount={s.viewerCount}
                isActive={s.isActive}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
