"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { use, useEffect, useState } from "react";

type BoutiqueTab = "products" | "services" | "reviews" | "collections" | "faq";

export default function BoutiquePage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = use(params);
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<BoutiqueTab>("products");
  const [collections, setCollections] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    api.get(`/vendors/store/public/${sellerId}`)
      .then(res => setData(res.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    api.get(`/collections/seller/${sellerId}`).then(res => setCollections(res.data?.data || [])).catch(() => {});
    api.get(`/store-faq/seller/${sellerId}`).then(res => setFaqs(res.data?.data || [])).catch(() => {});
    api.get(`/vendors/${sellerId}/follow/status`)
      .then(res => {
        setFollowing(res.data?.data?.following || false);
        setFollowerCount(res.data?.data?.followerCount || 0);
      }).catch(() => {});
  }, [sellerId]);

  const toggleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const res = await api.post(`/vendors/${sellerId}/follow`);
      setFollowing(res.data?.data?.following);
      setFollowerCount(prev => res.data?.data?.following ? prev + 1 : prev - 1);
    } catch {} finally { setFollowLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <div className="skeleton rounded-2xl h-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-60" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-white flex flex-col"><Header />
      <main className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-4xl">🏪</p>
        <p className="font-bold text-slate-700">Boutique introuvable</p>
        <Link href="/produits" className="text-rose-800 hover:underline text-sm">← Retour aux produits</Link>
      </main><Footer />
    </div>
  );

  const store = data?.store;
  const products: any[] = data?.products || [];
  const services: any[] = data?.services || [];
  const reviews: any[] = data?.reviews || [];
  const sellerName = store?.seller?.name || store?.name || "Boutique";

  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Promo banner */}
        {store?.bannerText && (
          <div className="rounded-xl px-5 py-3 mb-4 text-white text-sm font-semibold text-center" style={{ backgroundColor: store.bannerColor || "#9f1239" }}>
            {store.bannerText}
          </div>
        )}

        {/* Store header */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden mb-8" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div className="h-48 bg-gradient-to-r from-rose-100 to-rose-50 relative overflow-hidden">
            {store?.cover && <img src={store.cover} alt="cover" className="w-full h-full object-cover" />}
          </div>
          <div className="px-6 pb-6 -mt-10 flex items-end gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-xl border-4 border-white bg-rose-800 flex items-center justify-center text-white text-3xl font-black shadow overflow-hidden shrink-0">
              {store?.logo ? <img src={store.logo} alt="logo" className="w-full h-full object-cover" /> : sellerName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="pt-10 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{store?.name || sellerName}</h1>
                {store?.seller?.isVerified && (
                  <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">✓ Vérifié</span>
                )}
                {avgRating && (
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    ★ {avgRating} ({reviews.length} avis)
                  </span>
                )}
              </div>
              {store?.description && <p className="text-slate-500 text-sm mt-1 max-w-2xl">{store.description}</p>}
              {store?.businessHours && (() => {
                const days = ["lun","mar","mer","jeu","ven","sam","dim"] as const;
                const labels: Record<string, string> = { lun:"Lun", mar:"Mar", mer:"Mer", jeu:"Jeu", ven:"Ven", sam:"Sam", dim:"Dim" };
                const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                const todayH = store.businessHours[today];
                return todayH ? (
                  <p className="text-xs mt-1">
                    {todayH.closed ? (
                      <span className="text-red-500 font-semibold">🔴 Fermé aujourd'hui</span>
                    ) : (
                      <span className="text-green-600 font-semibold">🟢 Ouvert · {todayH.open}–{todayH.close}</span>
                    )}
                  </p>
                ) : null;
              })()}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                {store?.address && <span>📍 {store.address}</span>}
                {store?.phone && <span>📞 {store.phone}</span>}
                <span>📦 {products.length} produit{products.length !== 1 ? "s" : ""}</span>
                {services.length > 0 && <span>💼 {services.length} service{services.length !== 1 ? "s" : ""}</span>}
              </div>
            </div>
            <div className="mt-6 flex gap-2 flex-wrap">
              {followerCount > 0 && (
                <span className="text-xs text-slate-400 self-center">{followerCount} abonné{followerCount > 1 ? "s" : ""}</span>
              )}
              {user && user.id !== sellerId && (
                <button onClick={toggleFollow} disabled={followLoading}
                  className={`font-bold px-5 py-2.5 rounded-xl text-sm transition ${following ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"}`}>
                  {following ? "✓ Abonné" : "🔔 Suivre"}
                </button>
              )}
              {user && user.id !== sellerId && (
                <Link href={`/messages?with=${store?.seller?.id || sellerId}`}
                  className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-rose-900 transition text-sm flex items-center gap-2">
                  💬 Contacter
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key: "products", label: `📦 Produits (${products.length})` },
            ...(collections.length > 0 ? [{ key: "collections", label: `🗂️ Collections (${collections.length})` }] : []),
            ...(services.length > 0 ? [{ key: "services", label: `💼 Services (${services.length})` }] : []),
            ...(reviews.length > 0 ? [{ key: "reviews", label: `⭐ Avis (${reviews.length})` }] : []),
            ...(faqs.length > 0 ? [{ key: "faq", label: `❓ FAQ (${faqs.length})` }] : []),
          ] as { key: BoutiqueTab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? "bg-rose-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {tab === "products" && (
          <>
          {products.filter((p: any) => p.isFeatured).length > 0 && (
            <div className="mb-6">
              <h2 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">⭐</span> Coups de cœur
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.filter((p: any) => p.isFeatured).map((p: any) => (
                  <div key={p.id} className="relative">
                    <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">⭐ VEDETTE</div>
                    <ProductCard id={p.id} title={p.title}
                      price={p.promoPrice || p.price}
                      originalPrice={p.promoPrice ? p.price : undefined}
                      seller={sellerName} rating={p.averageRating || 0}
                      reviewCount={p.reviewCount || 0}
                      isVerified={store?.seller?.isVerified}
                      category={p.category} image={p.images?.[0]}
                      isBestSeller={p.isBestSeller} isNewArrival={p.isNewArrival}
                      stock={p.stock} stockAlert={p.stockAlert} />
                  </div>
                ))}
              </div>
              <hr className="my-6 border-slate-100" />
            </div>
          )}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-4xl block mb-3">📦</span>
              <p className="text-slate-500">Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} id={p.id} title={p.title}
                  price={p.promoPrice || p.price}
                  originalPrice={p.promoPrice ? p.price : undefined}
                  seller={sellerName} rating={p.averageRating || 0}
                  reviewCount={p.reviewCount || 0}
                  isVerified={store?.seller?.isVerified}
                  category={p.category} image={p.images?.[0]}
                  isBestSeller={p.isBestSeller} isNewArrival={p.isNewArrival}
                  stock={p.stock} stockAlert={p.stockAlert} />
              ))}
            </div>
          )
          </>
        )}

        {/* Collections tab */}
        {tab === "collections" && (
          <div className="space-y-6">
            {collections.map((col: any) => (
              <div key={col.id} className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  {col.cover && <img src={col.cover} alt={col.name} className="w-12 h-12 rounded-xl object-cover" />}
                  <div>
                    <h2 className="font-black text-slate-900">{col.name}</h2>
                    {col.description && <p className="text-slate-500 text-xs">{col.description}</p>}
                  </div>
                </div>
                {col.items?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {col.items.map((item: any) => (
                      <Link key={item.id} href={`/produits/${item.product.id}`} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.product.title}</p>
                        <p className="text-sm font-black text-rose-800">{(item.product.promoPrice || item.product.price).toFixed(2)} TND</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Aucun produit dans cette collection.</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Services tab */}
        {tab === "services" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((s: any) => (
              <ServiceCard key={s.id} id={s.id} title={s.title}
                provider={sellerName} startingPrice={s.price}
                rating={s.averageRating || 0} category={s.category}
                isVerified={store?.seller?.isVerified} />
            ))}
          </div>
        )}

        {/* Reviews tab */}
        {tab === "reviews" && (
          <div className="space-y-4 max-w-3xl">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm">
                    {r.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.user?.name || "Client"}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-xs ${i < r.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {r.comment && <p className="text-slate-600 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
        {/* FAQ tab */}
        {tab === "faq" && (
          <div className="max-w-2xl space-y-3">
            {faqs.map((faq: any) => (
              <div key={faq.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <span className="font-semibold text-slate-800 text-sm">{faq.question}</span>
                  <span className="text-slate-400 shrink-0 text-lg">{openFaq === faq.id ? "−" : "+"}</span>
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-4 text-slate-500 text-sm leading-relaxed border-t border-slate-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
