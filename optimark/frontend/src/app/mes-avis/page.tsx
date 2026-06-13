"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MesAvisPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/mes-avis"); return; }
    api.get("/reviews/my")
      .then(r => setReviews(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await api.delete(`/reviews/${id}`).catch(() => {});
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const STARS = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">⭐ Mes avis</h1>
        <p className="text-slate-500 text-sm mb-6">Vous avez laissé {reviews.length} avis.</p>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="font-bold text-slate-700 mb-2">Aucun avis pour le moment</p>
            <p className="text-slate-400 text-sm mb-4">Achetez des produits et partagez votre expérience.</p>
            <Link href="/produits" className="text-rose-800 hover:underline font-semibold text-sm">Découvrir des produits →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => {
              const item = r.product || r.service;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {r.product?.images?.[0] && (
                        <img src={r.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      )}
                      <div>
                        <Link href={r.product ? `/produits/${r.product.id}` : `/services/${r.service?.id}`}
                          className="font-bold text-slate-800 hover:text-rose-800 transition text-sm">
                          {item?.title || "Produit"}
                        </Link>
                        <p className="text-amber-400 text-sm">{STARS(r.rating)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                      <button onClick={() => remove(r.id)} className="text-xs text-slate-300 hover:text-red-500 transition px-2">✕</button>
                    </div>
                  </div>
                  {r.comment && <p className="text-slate-600 text-sm bg-slate-50 rounded-xl px-4 py-3">{r.comment}</p>}
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {r.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  {r.sellerReply && (
                    <div className="mt-3 border-l-4 border-rose-800 bg-rose-50 rounded-r-xl px-4 py-3">
                      <p className="text-xs font-bold text-rose-800 mb-1">Réponse du vendeur :</p>
                      <p className="text-slate-700 text-sm">{r.sellerReply}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
