"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(r => setService(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) { window.location.href = `/auth/connexion?redirect=/services/${id}`; return; }
    setOrdering(true);
    try {
      await api.post("/orders", { items: [{ serviceId: id, quantity: 1 }] });
      alert("✓ Commande passée ! Vous recevrez une confirmation.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la commande.");
    } finally {
      setOrdering(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    try {
      await api.post(`/reviews`, { serviceId: id, rating: reviewRating, comment: reviewText });
      const r = await api.get(`/services/${id}`);
      setService(r.data?.data);
      setReviewText("");
      setReviewRating(5);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 flex items-center justify-center text-slate-400">Chargement...</main>
      <Footer />
    </div>
  );

  if (!service) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-2xl">😕</p>
        <p className="font-bold text-slate-700">Service introuvable</p>
        <Link href="/services" className="text-rose-800 hover:underline text-sm">← Retour aux services</Link>
      </main>
      <Footer />
    </div>
  );

  const avgRating = service.reviews?.length
    ? (service.reviews.reduce((s: number, r: any) => s + r.rating, 0) / service.reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">Accueil</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-600">Services</Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[200px]">{service.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image / header */}
            <div className="bg-gradient-to-br from-rose-800 to-rose-600 rounded-2xl h-56 flex items-center justify-center relative overflow-hidden">
              {service.images?.[0] ? (
                <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">💼</span>
              )}
              {service.category && (
                <span className="absolute top-4 left-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {service.category}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">{service.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="font-bold text-slate-800 text-sm">{avgRating}</span>
                    <span className="text-slate-400 text-xs">({service.reviews.length} avis)</span>
                  </div>
                )}
                <Link href={`/boutique/${service.sellerId}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-rose-800 transition">
                  <span>🏪</span>
                  <span>{service.seller?.name}</span>
                  {service.seller?.isVerified && <span className="text-green-600 text-xs font-bold">✓</span>}
                </Link>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-bold text-slate-800 mb-3">Description du service</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-bold text-slate-800 mb-4">Avis clients ({service.reviews?.length || 0})</h2>
              {service.reviews?.length === 0 && (
                <p className="text-slate-400 text-sm">Aucun avis pour l&apos;instant. Soyez le premier !</p>
              )}
              <div className="space-y-4">
                {service.reviews?.map((rev: any) => (
                  <div key={rev.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">
                        {rev.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{rev.user?.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs ${i < rev.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-slate-600 text-sm">{rev.comment}</p>}
                  </div>
                ))}
              </div>

              {user && (
                <form onSubmit={submitReview} className="mt-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Laisser un avis</h3>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)}
                        className={`text-2xl transition ${n <= reviewRating ? "text-amber-400" : "text-slate-200"}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                    placeholder="Votre commentaire (optionnel)..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                  <button type="submit" disabled={submittingReview}
                    className="bg-rose-800 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-rose-900 transition disabled:opacity-60">
                    {submittingReview ? "Envoi..." : "Publier l'avis"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right — order card */}
          <div>
            <div className="sticky top-24 bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-6 space-y-5">
              <div>
                <p className="text-3xl font-black text-rose-800">{Number(service.price).toFixed(2)} TND</p>
                {service.deliveryTime && (
                  <p className="text-slate-500 text-sm mt-1">⏱ Livraison en {service.deliveryTime}</p>
                )}
              </div>

              {service.features?.length > 0 && (
                <ul className="space-y-2">
                  {service.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <button onClick={handleOrder} disabled={ordering || !service.isActive}
                className="w-full bg-rose-800 text-white font-bold py-3.5 rounded-xl hover:bg-rose-900 transition disabled:opacity-60">
                {!service.isActive ? "Service indisponible" : ordering ? "Commande en cours..." : "Commander ce service"}
              </button>

              <Link href={`/messages?with=${service.sellerId}`}
                className="block w-full text-center border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:border-rose-300 hover:text-rose-800 transition text-sm">
                💬 Contacter le prestataire
              </Link>

              <div className="text-xs text-slate-400 text-center space-y-1">
                <p>✓ Paiement sécurisé</p>
                <p>✓ Remboursement garanti sous 7 jours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
