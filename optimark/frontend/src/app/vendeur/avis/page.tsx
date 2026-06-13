"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/reviews/seller").then(r => setReviews(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitReply = async (reviewId: string) => {
    const reply = replyMap[reviewId]?.trim();
    if (!reply) return;
    setSubmitting(reviewId);
    try {
      const res = await api.patch(`/reviews/${reviewId}/reply`, { reply });
      setReviews(prev => prev.map(r => r.id === reviewId ? res.data?.data : r));
      setReplyMap(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSubmitting(null);
    }
  };

  const STARS = (n: number) => Array.from({ length: 5 }, (_, i) => i < n ? "★" : "☆").join("");

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-6">⭐ Avis clients</h1>

        {!loading && reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-5xl font-black text-amber-500">{avgRating.toFixed(1)}</p>
                <p className="text-amber-400 text-lg mt-1">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</p>
                <p className="text-slate-400 text-xs mt-1">{reviews.length} avis</p>
              </div>
              <div className="flex-1 min-w-[200px] space-y-1.5">
                {distribution.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <span className="text-amber-400 text-xs">★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <p className="text-4xl mb-3">⭐</p>
            <p className="font-semibold">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-800 text-sm">
                      {r.user?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{r.user?.name}</p>
                      <p className="text-amber-400 text-sm">{STARS(r.rating)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>

                {r.product && <p className="text-xs text-rose-700 font-medium mb-2">📦 {r.product.title}</p>}
                {r.comment && <p className="text-slate-600 text-sm mb-3 bg-slate-50 rounded-lg px-3 py-2">{r.comment}</p>}

                {r.sellerReply ? (
                  <div className="border-l-4 border-rose-800 bg-rose-50 rounded-r-xl px-4 py-3">
                    <p className="text-xs font-bold text-rose-800 mb-1">✓ Votre réponse :</p>
                    <p className="text-slate-700 text-sm">{r.sellerReply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <textarea
                      value={replyMap[r.id] || ""}
                      onChange={e => setReplyMap(prev => ({ ...prev, [r.id]: e.target.value }))}
                      placeholder="Répondez à cet avis..."
                      rows={2}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none"
                    />
                    <button
                      onClick={() => submitReply(r.id)}
                      disabled={!replyMap[r.id]?.trim() || submitting === r.id}
                      className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-4 rounded-xl text-sm transition disabled:opacity-50 shrink-0"
                    >
                      {submitting === r.id ? "..." : "Répondre"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
