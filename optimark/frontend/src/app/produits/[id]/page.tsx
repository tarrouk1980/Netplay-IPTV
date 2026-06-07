"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const MOCK_REVIEWS = [
  { id: 1, author: "Sami B.", rating: 5, comment: "Produit excellent, conforme à la description. Livraison rapide.", date: "15 mai 2025" },
  { id: 2, author: "Rania M.", rating: 4, comment: "Très bon rapport qualité/prix. Je recommande ce vendeur.", date: "3 mai 2025" },
  { id: 3, author: "Youssef K.", rating: 5, comment: "Parfait ! Je suis très satisfait de mon achat.", date: "22 avril 2025" },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
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
    ]).then(([pRes, sRes]) => {
      if (!mounted) return;
      setProduct(pRes?.data?.data || null);
      setSimilar(sRes?.data?.data || []);
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
  const reviewCount = product.reviewCount || MOCK_REVIEWS.length;

  const handleAddToCart = () => {
    addItem({ id: product.id, title: product.title, price: product.price, seller, image: images[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, title: product.title, price: product.price, seller, image: images[0] });
    router.push("/panier");
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

            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-rose-800">{Number(product.price).toFixed(2)} <span className="text-base font-bold">TND</span></span>
              {product.originalPrice && (
                <span className="text-slate-400 text-base line-through">{Number(product.originalPrice).toFixed(2)} TND</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">{seller}</span>
              {isVerified && <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Vérifié</span>}
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
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
              <p>✅ Livraison disponible partout en Tunisie — OPTIMARK Express 24h</p>
              <p>✅ Paiement sécurisé (Konnect, Paymee, Cash à la livraison)</p>
              <p>✅ Retour gratuit sous 7 jours</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-14">
          <h2 className="text-xl font-black text-slate-900 mb-6">Avis clients</h2>
          <div className="space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-white border border-slate-100 rounded-xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-800 text-sm">
                      {review.author.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">{review.author}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                  ))}
                </div>
                <p className="text-slate-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-black text-slate-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similar.map((p: any) => (
                <ProductCard key={p.id} id={p.id} title={p.title} price={p.price} seller={p.seller?.name || "Vendeur"} rating={0} isVerified={p.seller?.isVerified} category={p.category} image={p.image} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
