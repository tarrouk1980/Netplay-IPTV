"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VendeurLivePage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [products, setProducts] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion"); return; }
    api.get("/live/my").then(r => setHistory(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const productIds = products.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.post("/live", { title, products: productIds });
      if (res.data?.success) {
        router.push(`/live/${res.data.data.id}`);
      } else {
        setError(res.data?.message || "Erreur");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const diff = Math.floor((e.getTime() - s.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Live Commerce</h1>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Démarrer un nouveau live</h2>
          {error && <p className="text-rose-800 text-sm mb-4 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre du live</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="ex: Soldes été 2024 — Jusqu'à -50%"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IDs des produits à mettre en avant (séparés par des virgules)</label>
              <input
                type="text"
                value={products}
                onChange={(e) => setProducts(e.target.value)}
                placeholder="id1, id2, id3..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-slate-400 text-xs mt-1">Optionnel. Copiez les IDs depuis vos produits.</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-rose-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-rose-900 transition disabled:opacity-50"
            >
              {submitting ? "Démarrage..." : "Démarrer le live"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Historique des lives</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Aucun live pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {history.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-800">{s.title}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(s.startedAt).toLocaleDateString("fr-FR")} — {formatDuration(s.startedAt, s.endedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600 text-sm font-medium">{s.viewerCount} viewers max</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.isActive ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-500"}`}>
                      {s.isActive ? "EN DIRECT" : "Terminé"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
