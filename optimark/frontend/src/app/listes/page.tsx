"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WishlistsPage() {
  const { user, loading } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth/connexion?redirect=/listes"); return; }
    load();
  }, [user, loading]);

  const load = () => api.get("/wishlists").then(r => {
    const data = r.data?.data || [];
    setWishlists(data);
    if (data.length > 0 && !active) setActive(data[0].id);
  }).catch(() => {});

  const createList = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/wishlists", { name: newName.trim(), isPublic: false });
      const created = res.data?.data;
      setWishlists(prev => [...prev, created]);
      setActive(created.id);
      setNewName("");
    } finally {
      setCreating(false);
    }
  };

  const deleteList = async (id: string) => {
    await api.delete(`/wishlists/${id}`).catch(() => {});
    setWishlists(prev => {
      const updated = prev.filter(w => w.id !== id);
      setActive(updated[0]?.id || null);
      return updated;
    });
  };

  const removeItem = async (wishlistId: string, productId: string) => {
    await api.delete(`/wishlists/${wishlistId}/items/${productId}`).catch(() => {});
    setWishlists(prev => prev.map(w => w.id === wishlistId ? { ...w, items: w.items.filter((i: any) => i.productId !== productId) } : w));
  };

  const addToCart = (item: any) => {
    addItem({ id: item.product.id, title: item.product.title, price: item.product.promoPrice ?? item.product.price, seller: item.product.seller?.name || "Vendeur", image: item.product.images?.[0] });
  };

  const activeList = wishlists.find(w => w.id === active);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-6">📋 Mes listes</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0 space-y-2">
            {wishlists.map(w => (
              <button key={w.id} onClick={() => setActive(w.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${active === w.id ? "bg-rose-800 text-white" : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-100"}`}>
                <span className="block truncate">{w.name}</span>
                <span className="text-xs opacity-70">{w.items?.length || 0} article(s)</span>
              </button>
            ))}

            {/* Create new */}
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && createList()}
                placeholder="Nouvelle liste..." className="w-full text-sm outline-none text-slate-700 bg-transparent" />
              <button onClick={createList} disabled={creating || !newName.trim()} className="mt-2 text-xs font-bold text-rose-800 hover:text-rose-900 disabled:opacity-40">
                {creating ? "..." : "+ Créer"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {!activeList ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-semibold">Créez votre première liste</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-slate-900 text-lg">{activeList.name}</h2>
                  <div className="flex gap-2">
                    {activeList.isPublic && (
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/listes/public/${activeList.id}`)} className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                        🔗 Partager
                      </button>
                    )}
                    <button onClick={() => deleteList(activeList.id)} className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
                      🗑 Supprimer
                    </button>
                  </div>
                </div>

                {activeList.items?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-3xl mb-2">📦</p>
                    <p className="font-semibold text-sm">Aucun produit dans cette liste</p>
                    <Link href="/produits" className="text-rose-800 text-sm hover:underline mt-1 inline-block">Parcourir les produits →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeList.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/produits/${item.product.id}`} className="font-semibold text-slate-800 hover:text-rose-800 text-sm truncate block">{item.product.title}</Link>
                          <p className="text-rose-800 font-black text-sm">{Number(item.product.promoPrice ?? item.product.price).toFixed(2)} TND</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => addToCart(item)} className="text-xs font-bold text-white bg-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-900">🛒</button>
                          <button onClick={() => removeItem(activeList.id, item.productId)} className="text-xs font-bold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
