"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { addToCompare } from "@/app/comparer/page";
import RecentlyViewed, { trackView } from "@/components/RecentlyViewed";


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setQty(1);
    setActiveImg(0);
    setAdded(false);

    Promise.all([
      api.get(`/products/${id}`).catch(() => null),
      api.get(`/recommendations/similar/${id}?limit=4`).catch(() => null),
      user ? api.get(`/favorites/${id}/status`).catch(() => null) : Promise.resolve(null),
      api.get(`/reviews/product/${id}`).catch(() => null),
      api.get(`/questions/product/${id}`).catch(() => null),
      user ? api.get(`/price-alerts/${id}/status`).catch(() => null) : Promise.resolve(null),
    ]).then(([pRes, sRes, fRes, rRes, qRes, paRes]) => {
      if (!mounted) return;
      const prod = pRes?.data?.data || null;
      if (prod) trackView(prod.id);
      setProduct(prod);
      setSimilar(sRes?.data?.data || []);
      setFavorited(fRes?.data?.favorited || false);
      setReviews(rRes?.data?.data || []);
      setQuestions(qRes?.data?.data || []);
      setAlertActive(paRes?.data?.data?.subscribed || false);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/2 skeleton rounded-2xl h-80" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-lg" />
              <div className="skeleton h-6 w-1/3 rounded-lg" />
              <div className="skeleton h-24 w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <span className="text-5xl block mb-4">📦</span>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Produit introuvable</h1>
          <Link href="/produits" className="text-rose-800 font-semibold hover:underline">← Retour aux produits</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images: string[] = product.images?.length ? product.images : product.image ? [product.image] : [];
  const seller = product.seller?.name || "Vendeur";
  const isVerified = !!product.seller?.isVerified;
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || reviews.length;

  const handleAddToCart = () => {
    addItem({ id: product.id, title: product.title, price: product.price, seller, image: images[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, title: product.title, price: product.price, seller, image: images[0] });
    router.push("/panier");
  };

  const handleToggleFavorite = async () => {
    if (!user) { router.push("/auth/connexion"); return; }
    setFavLoading(true);
    try {
      const res = await api.post(`/favorites/${product.id}/toggle`);
      setFavorited(res.data?.favorited ?? !favorited);
    } finally {
      setFavLoading(false);
    }
  };

  const handleToggleAlert = async () => {
    if (!user) { router.push("/auth/connexion"); return; }
    setAlertLoading(true);
    try {
      if (alertActive) {
        await api.delete(`/price-alerts/${product.id}`);
        setAlertActive(false);
      } else {
        await api.post(`/price-alerts/${product.id}`, {});
        setAlertActive(true);
      }
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-rose-800">Accueil</Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-rose-800">Produits</Link>
          {product.category && (
            <>
              <span>/</span>
              <span className="text-slate-600">{product.category}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Gallery */}
          <div className="w-full md:w-1/2">
            <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center mb-4 overflow-hidden">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">📦</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`bg-slate-100 rounded-lg h-16 overflow-hidden ring-2 transition ${activeImg === i ? "ring-rose-800" : "ring-transparent hover:ring-rose-200"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div>
              {product.category && <span className="text-xs text-rose-700 font-bold uppercase tracking-wide">{product.category}</span>}
              <h1 className="text-2xl font-black text-slate-900 mt-1">{product.title}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-black text-rose-800">
                {Number(product.promoPrice || product.price).toFixed(2)} <span className="text-base font-bold">TND</span>
              </span>
              {product.promoPrice && (
                <>
                  <span className="text-slate-400 text-base line-through">{Number(product.price).toFixed(2)} TND</span>
                  <span className="bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    -{Math.round((1 - product.promoPrice / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>
            {/* Stock badges */}
            <div className="flex gap-2 flex-wrap">
              {product.isBestSeller && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">🏆 Best Seller</span>}
              {product.isNewArrival && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">🆕 Nouveau</span>}
              {product.stock === 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Épuisé</span>}
              {product.stock > 0 && product.stock <= (product.stockAlert || 5) && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">⚠️ Plus que {product.stock} en stock !</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/boutique/${product.sellerId}`} className="font-medium text-rose-800 hover:underline">{seller}</Link>
              {isVerified && <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Vérifié</span>}
              <Link href={`/messages?with=${product.sellerId}`} className="text-xs font-semibold text-slate-500 hover:text-rose-800 bg-slate-100 hover:bg-rose-50 px-3 py-1 rounded-full transition">
                💬 Contacter
              </Link>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.floor(rating) ? "text-amber-400 text-lg" : "text-slate-200 text-lg"}>★</span>
              ))}
              <span className="text-slate-500 text-sm ml-1">{rating}/5 ({reviewCount} avis)</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {product.description || "Aucune description fournie pour ce produit."}
            </p>

            {/* Quantity selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Quantité :</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600">−</button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button onClick={handleBuyNow} className="flex-1 bg-rose-800 text-white font-bold py-3 rounded-xl hover:bg-rose-900 transition">
                Acheter maintenant
              </button>
              <button onClick={handleAddToCart} className="flex-1 border-2 border-rose-800 text-rose-800 font-bold py-3 rounded-xl hover:bg-rose-50 transition">
                {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
              </button>
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition shrink-0 ${favorited ? "bg-rose-50 border-rose-800 text-rose-800" : "border-slate-300 text-slate-400 hover:border-rose-300 hover:text-rose-500"}`}
                title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {favorited ? "♥" : "♡"}
              </button>
              <button
                onClick={handleToggleAlert}
                disabled={alertLoading}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg transition shrink-0 ${alertActive ? "bg-amber-50 border-amber-400 text-amber-600" : "border-slate-300 text-slate-400 hover:border-amber-300 hover:text-amber-500"}`}
                title={alertActive ? "Désactiver l'alerte prix" : "Activer l'alerte prix"}
              >
                🔔
              </button>
              <button
                onClick={() => { addToCompare(product.id); }}
                className="w-12 h-12 rounded-xl border-2 border-slate-300 text-slate-400 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center text-lg transition shrink-0"
                title="Ajouter au comparateur"
              >
                ⚖️
              </button>
            </div>
            <Link href="/comparer" className="text-xs text-slate-400 hover:text-blue-600 transition mt-1 self-start">
              Voir le comparateur →
            </Link>

            {/* Marque */}
            {product.brand && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Marque :</span>
                <span className="font-bold text-slate-800">{product.brand}</span>
              </div>
            )}

            {/* Variants */}
            {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="space-y-3">
                {(product.variants as {name:string;options:string[]}[]).map((v, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-slate-700 mb-2">{v.name} :</p>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map(opt => (
                        <button key={opt} className="px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-rose-800 hover:text-rose-800 transition">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
              <p>✅ Livraison disponible partout en Tunisie — OPTIMARK Express 24h</p>
              <p>✅ Paiement sécurisé (Konnect, Paymee, Cash à la livraison)</p>
              <p>✅ Retour gratuit sous 7 jours</p>
            </div>
          </div>
        </div>

        {/* Fiche technique */}
        {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Fiche technique</h2>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs as Record<string,string>).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-5 py-3 font-semibold text-slate-600 w-1/3 border-r border-slate-100">{key}</td>
                      <td className="px-5 py-3 text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-14">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            Avis clients {reviews.length > 0 && <span className="text-slate-400 font-normal text-base">({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400">
              <p className="text-3xl mb-2">💬</p>
              <p>Aucun avis pour ce produit pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-white border border-slate-100 rounded-xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-800 text-sm">
                        {review.user?.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-semibold text-slate-800">{review.user?.name || "Anonyme"}</span>
                    </div>
                    <span className="text-slate-400 text-xs">{new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                    ))}
                  </div>
                  {review.comment && <p className="text-slate-600 text-sm">{review.comment}</p>}
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {review.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-100" />
                      ))}
                    </div>
                  )}
                  {review.sellerReply && (
                    <div className="mt-3 ml-4 border-l-4 border-rose-800 bg-rose-50 rounded-r-xl px-3 py-2">
                      <p className="text-xs font-bold text-rose-800 mb-1">Réponse du vendeur :</p>
                      <p className="text-sm text-slate-700">{review.sellerReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Write a review */}
          {user && (
            <WriteReview productId={id} onSubmitted={(r) => setReviews(prev => [r, ...prev])} />
          )}
        </section>

        {/* Q&A */}
        <section className="mt-14">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            Questions & Réponses {questions.length > 0 && <span className="text-slate-400 font-normal text-base">({questions.length})</span>}
          </h2>

          {questions.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400">
              <p className="text-3xl mb-2">❓</p>
              <p>Aucune question pour ce produit.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {questions.map((q: any) => (
                <div key={q.id} className="bg-white border border-slate-100 rounded-xl p-5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                      {q.user?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{q.question}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{q.user?.name} · {new Date(q.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                  {q.answer ? (
                    <div className="ml-11 bg-rose-50 border-l-4 border-rose-800 rounded-r-xl px-4 py-3">
                      <p className="text-xs font-bold text-rose-800 mb-1">Réponse du vendeur :</p>
                      <p className="text-sm text-slate-700">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="ml-11 bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-400 italic">
                      En attente de réponse du vendeur...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {user && (
            <AskQuestion productId={id} onSubmitted={(q) => setQuestions(prev => [q, ...prev])} />
          )}
        </section>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-black text-slate-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similar.map((p: any) => (
                <ProductCard key={p.id} id={p.id} title={p.title} price={p.promoPrice || p.price} originalPrice={p.promoPrice ? p.price : undefined} seller={p.seller?.name || "Vendeur"} rating={0} isVerified={p.seller?.isVerified} category={p.category} image={p.images?.[0]} isBestSeller={p.isBestSeller} stock={p.stock} stockAlert={p.stockAlert} />
              ))}
            </div>
          </section>
        )}
        <RecentlyViewed currentId={id} />
      </main>

      <Footer />
    </div>
  );
}

function AskQuestion({ productId, onSubmitted }: { productId: string; onSubmitted: (q: any) => void }) {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/questions", { productId, question });
      onSubmitted(res.data?.data);
      setSubmitted(true);
      setQuestion("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      alert("Erreur lors de l'envoi de la question");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h3 className="font-bold text-slate-800 mb-3">Poser une question</h3>
      {submitted ? (
        <p className="text-green-600 font-semibold text-sm">✓ Votre question a été envoyée au vendeur.</p>
      ) : (
        <div className="flex gap-3">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Votre question sur ce produit..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100"
          />
          <button type="submit" disabled={!question.trim() || submitting}
            className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50">
            {submitting ? "..." : "Envoyer"}
          </button>
        </div>
      )}
    </form>
  );
}

function WriteReview({ productId, onSubmitted }: { productId: string; onSubmitted: (r: any) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    const images = imageUrls.split("\n").map(u => u.trim()).filter(Boolean);
    try {
      const res = await api.post("/reviews", { productId, rating, comment, images });
      onSubmitted(res.data?.data);
      setSubmitted(true);
      setRating(0);
      setComment("");
    } catch {
      alert("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-semibold text-sm">
      ✓ Merci pour votre avis !
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white border border-slate-100 rounded-xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h3 className="font-bold text-slate-800 mb-4">Laisser un avis</h3>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button"
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i + 1)}
            className={`text-2xl transition ${i < (hover || rating) ? "text-amber-400" : "text-slate-200"}`}>
            ★
          </button>
        ))}
        {rating > 0 && <span className="text-slate-500 text-sm ml-2">{["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"][rating]}</span>}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Partagez votre expérience avec ce produit... (optionnel)"
        rows={3}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none mb-3"
      />
      <textarea
        value={imageUrls}
        onChange={e => setImageUrls(e.target.value)}
        placeholder="Photos (URLs, une par ligne) — optionnel"
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none mb-3"
      />
      <button type="submit" disabled={!rating || submitting}
        className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-6 py-2 rounded-xl text-sm transition disabled:opacity-50">
        {submitting ? "Envoi..." : "Publier l'avis"}
      </button>
    </form>
  );
}
