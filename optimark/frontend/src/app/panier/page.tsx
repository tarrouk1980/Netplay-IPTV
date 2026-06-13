"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftDiscount, setGiftDiscount] = useState(0);
  const [giftError, setGiftError] = useState("");
  const [giftApplied, setGiftApplied] = useState(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState<{ points: number; equivalentTND: string } | null>(null);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [loyaltyError, setLoyaltyError] = useState("");
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const handleOrder = async () => {
    if (!user) { router.push("/auth/connexion?redirect=/panier"); return; }
    if (!selectedPayment) return;
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      alert("Veuillez remplir tous les champs de livraison obligatoires.");
      return;
    }
    setProcessing(true);

    try {
      const paymentMethod = selectedPayment === "konnect" ? "KONNECT"
        : selectedPayment === "paymee" ? "PAYMEE" : "CASH_ON_DELIVERY";

      const orderRes = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        deliveryAddress: address,
        ...(couponApplied && couponCode ? { couponCode } : {}),
      });

      const order = orderRes.data.data;

      if (selectedPayment === "konnect" || selectedPayment === "paymee") {
        const payRes = await api.post(`/payments/${selectedPayment}/initiate`, {
          orderId: order.id,
          amount: finalTotal,
          description: `Commande OPTIMARK #${order.id.slice(0, 8)}`,
        });
        const payUrl = payRes.data.data?.payUrl || payRes.data.data?.payment_url || payRes.data.data?.url;
        clearCart();
        if (payUrl) window.location.href = payUrl;
        else router.push("/commandes?payment=success");
      } else {
        clearCart();
        router.push("/commandes?payment=success");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la commande");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    api.get("/loyalty/balance").then(r => setLoyaltyBalance(r.data?.data)).catch(() => {});
  }, [user]);

  const applyLoyalty = async () => {
    if (!loyaltyBalance || loyaltyBalance.points < 100) { setLoyaltyError("Il faut au moins 100 points."); return; }
    const maxRedeemable = Math.min(loyaltyBalance.points, Math.floor((total - couponDiscount - giftDiscount) * 100));
    const rounded = Math.floor(maxRedeemable / 100) * 100;
    if (rounded === 0) { setLoyaltyError("Solde insuffisant par rapport au montant restant."); return; }
    setLoyaltyError("");
    try {
      const res = await api.post("/loyalty/redeem", { points: rounded });
      const disc = res.data?.data?.discountTND || 0;
      setLoyaltyDiscount(disc);
      setPointsUsed(rounded);
      setLoyaltyBalance(prev => prev ? { ...prev, points: prev.points - rounded } : null);
    } catch (e: any) {
      setLoyaltyError(e.response?.data?.message || "Erreur");
    }
  };

  const finalTotal = Math.max(0, total - couponDiscount - giftDiscount - loyaltyDiscount);

  const applyGiftCard = async () => {
    if (!giftCode.trim()) return;
    setGiftError("");
    try {
      const res = await api.post("/gift-cards/validate", { code: giftCode.trim().toUpperCase() });
      const balance = res.data?.data?.balance || 0;
      setGiftDiscount(Math.min(balance, total - couponDiscount));
      setGiftApplied(true);
    } catch (e: any) {
      setGiftError(e.response?.data?.message || "Code invalide");
      setGiftDiscount(0);
      setGiftApplied(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const res = await api.get("/coupons/validate", { params: { code: couponCode, amount: total } });
      setCouponDiscount(res.data?.data?.discountAmount || 0);
      setCouponApplied(true);
    } catch (e: any) {
      setCouponError(e.response?.data?.message || "Code invalide");
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const setAddr = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddress(a => ({ ...a, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Mon panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-xl font-bold text-slate-700 mb-2">Votre panier est vide</p>
            <Link href="/produits" className="text-rose-800 hover:underline text-sm font-semibold">
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left — items + address */}
            <div className="flex-1 space-y-4">
              {/* Cart items */}
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <span className="text-3xl">📦</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 mb-0.5">{item.title}</h3>
                    <p className="text-slate-400 text-xs mb-3">Vendu par {item.seller}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600">−</button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-rose-800">{(item.price * item.quantity).toFixed(2)} TND</span>
                        <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-800 text-xs transition">✕ Retirer</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery address */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">📍 Adresse de livraison</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nom complet *</label>
                    <input value={address.fullName} onChange={setAddr("fullName")} placeholder="Prénom Nom" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone *</label>
                    <input value={address.phone} onChange={setAddr("phone")} placeholder="+216 XX XXX XXX" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse *</label>
                    <input value={address.address} onChange={setAddr("address")} placeholder="Rue, numéro, appartement..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Ville *</label>
                    <input value={address.city} onChange={setAddr("city")} placeholder="Tunis, Sfax, Sousse..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Code postal</label>
                    <input value={address.postalCode} onChange={setAddr("postalCode")} placeholder="1000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Instructions (optionnel)</label>
                    <textarea value={address.notes} onChange={setAddr("notes")} placeholder="Instructions pour la livraison..." rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right — summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sticky top-24" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h2 className="font-black text-slate-900 mb-4">Récapitulatif</h2>

                <div className="space-y-2 mb-4 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[160px]">{item.title} x{item.quantity}</span>
                      <span className="shrink-0 ml-2">{(item.price * item.quantity).toFixed(2)} TND</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-slate-500 text-xs pt-1">
                    <span>Livraison</span>
                    <span className="text-green-600 font-semibold">Gratuite</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Code promo ({couponCode})</span>
                      <span>−{couponDiscount.toFixed(2)} TND</span>
                    </div>
                  )}
                  {giftDiscount > 0 && (
                    <div className="flex justify-between text-purple-600 font-semibold">
                      <span>🎁 Carte cadeau</span>
                      <span>−{giftDiscount.toFixed(2)} TND</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>⭐ Points fidélité</span>
                      <span>−{loyaltyDiscount.toFixed(2)} TND</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-base text-slate-900">
                    <span>Total</span>
                    <span className="text-rose-800">{finalTotal.toFixed(2)} TND</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-4">
                  <p className="font-bold text-slate-700 mb-2 text-sm">Code promo</p>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <span className="text-green-700 font-bold text-sm">✓ {couponCode} appliqué</span>
                      <button onClick={() => { setCouponApplied(false); setCouponCode(""); setCouponDiscount(0); }} className="text-xs text-slate-400 hover:text-red-500">✕</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="PROMO20" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-100" />
                      <button onClick={applyCoupon} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-3 py-2 rounded-lg transition">Appliquer</button>
                    </div>
                  )}
                  {couponError && <p className="text-rose-700 text-xs mt-1">{couponError}</p>}
                </div>

                {/* Gift card */}
                <div className="mb-4">
                  <p className="font-bold text-slate-700 mb-2 text-sm">🎁 Carte cadeau</p>
                  {giftApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <span className="text-green-700 font-bold text-sm">✓ -{giftDiscount.toFixed(2)} TND appliqués</span>
                      <button onClick={() => { setGiftApplied(false); setGiftCode(""); setGiftDiscount(0); }} className="text-xs text-slate-400 hover:text-red-500">✕</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={giftCode} onChange={e => setGiftCode(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX-XXXX" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-100" />
                      <button onClick={applyGiftCard} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-3 py-2 rounded-lg transition">Appliquer</button>
                    </div>
                  )}
                  {giftError && <p className="text-rose-700 text-xs mt-1">{giftError}</p>}
                </div>

                {/* Loyalty points */}
                {loyaltyBalance && loyaltyBalance.points >= 100 && (
                  <div className="mb-4">
                    <p className="font-bold text-slate-700 mb-2 text-sm">⭐ Points fidélité</p>
                    {loyaltyDiscount > 0 ? (
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-amber-700 font-bold text-sm">✓ {pointsUsed} pts = -{loyaltyDiscount.toFixed(2)} TND</span>
                        <button onClick={() => { setLoyaltyDiscount(0); setPointsUsed(0); setLoyaltyBalance(prev => prev ? { ...prev, points: prev.points + pointsUsed } : null); }} className="text-xs text-slate-400 hover:text-red-500">✕</button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-2">
                          <span className="text-amber-700 text-sm">{loyaltyBalance.points} pts disponibles ({loyaltyBalance.equivalentTND} TND)</span>
                          <button onClick={applyLoyalty} className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition">Utiliser</button>
                        </div>
                        {loyaltyError && <p className="text-rose-600 text-xs">{loyaltyError}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment method */}
                <div className="mb-4">
                  <p className="font-bold text-slate-700 mb-2 text-sm">Mode de paiement</p>
                  <div className="space-y-2">
                    {[
                      { id: "konnect", label: "Konnect", icon: "💳" },
                      { id: "paymee", label: "Paymee", icon: "💳" },
                      { id: "cash", label: "Cash à la livraison", icon: "💵" },
                    ].map((method) => (
                      <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${selectedPayment === method.id ? "border-rose-800 bg-rose-50" : "border-slate-200 hover:border-rose-300"}`}>
                        <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="accent-rose-800" />
                        <span>{method.icon}</span>
                        <span className="text-slate-700 text-sm font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!selectedPayment || processing}
                  onClick={handleOrder}
                  className="w-full bg-rose-800 text-white font-black py-3 rounded-xl hover:bg-rose-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Traitement..." : "Passer la commande"}
                </button>

                {!user && (
                  <p className="text-xs text-slate-400 text-center mt-2">
                    <Link href="/auth/connexion" className="text-rose-800 hover:underline">Connectez-vous</Link> pour commander
                  </p>
                )}

                <div className="mt-4 space-y-1 text-xs text-slate-400">
                  <p>✅ Livraison Express 24h OPTIMARK</p>
                  <p>✅ Paiement 100% sécurisé</p>
                  <p>✅ Retour gratuit sous 7 jours</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
