"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleOrder = async () => {
    if (!user) {
      router.push("/auth/connexion?redirect=/panier");
      return;
    }
    if (!selectedPayment) return;
    setProcessing(true);

    try {
      const paymentMethod = selectedPayment === "konnect"
        ? "KONNECT"
        : selectedPayment === "paymee"
        ? "PAYMEE"
        : "CASH_ON_DELIVERY";

      const orderRes = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
      });

      const order = orderRes.data.data;

      if (selectedPayment === "konnect" || selectedPayment === "paymee") {
        const endpoint = `/payments/${selectedPayment}/initiate`;
        const payRes = await api.post(endpoint, {
          orderId: order.id,
          amount: total,
          description: `Commande OPTIMARK #${order.id.slice(0, 8)}`,
        });

        const payUrl =
          payRes.data.data?.payUrl ||
          payRes.data.data?.payment_url ||
          payRes.data.data?.url;

        clearCart();
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          router.push("/commandes?payment=success");
        }
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Mon panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-xl font-medium">Votre panier est vide</p>
            <button
              onClick={() => router.push("/produits")}
              className="mt-4 text-rose-800 hover:underline text-sm"
            >
              Découvrir les produits
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm mb-3">Vendu par {item.seller}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-rose-800">{(item.price * item.quantity).toFixed(2)} TND</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-rose-800 text-sm transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-slate-800 text-lg mb-4">Récapitulatif</h2>

                <div className="space-y-2 mb-4 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[160px]">{item.title} x{item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} TND</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800 text-base">
                    <span>Total</span>
                    <span className="text-rose-800">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-slate-700 mb-3 text-sm">Mode de paiement</p>
                  <div className="space-y-2">
                    {[
                      { id: "konnect", label: "Konnect", icon: "💳" },
                      { id: "paymee", label: "Paymee", icon: "💳" },
                      { id: "cash", label: "Cash à la livraison", icon: "💵" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                          selectedPayment === method.id
                            ? "border-rose-800 bg-rose-50"
                            : "border-slate-200 hover:border-rose-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="accent-rose-800"
                        />
                        <span>{method.icon}</span>
                        <span className="text-slate-700 text-sm font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!selectedPayment || processing}
                  onClick={handleOrder}
                  className="w-full bg-rose-800 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Traitement..." : "Passer la commande"}
                </button>

                {!user && (
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Vous devez être connecté pour commander
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
