"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  promoPrice?: number;
  stock: number;
  stockAlert: number;
  isActive: boolean;
  isBestSeller: boolean;
  category: string;
  createdAt: string;
  images?: string[];
}

export default function VendeurProduitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
      router.replace("/auth/connexion");
      return;
    }
    api.get("/vendors/products")
      .then(r => setProducts(r.data?.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user, loading]);

  const toggleActive = async (p: Product) => {
    await api.patch(`/products/${p.id}`, { isActive: !p.isActive }).catch(() => {});
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  const toggleBestSeller = async (p: Product) => {
    await api.patch(`/products/${p.id}`, { isBestSeller: !p.isBestSeller }).catch(() => {});
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isBestSeller: !x.isBestSeller } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    await api.delete(`/products/${id}`).catch(() => {});
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const cloneProduct = async (id: string) => {
    try {
      const res = await api.post(`/products/${id}/clone`);
      setProducts(prev => [res.data.data, ...prev]);
    } catch { alert("Erreur lors de la duplication"); }
  };

  const filtered = products.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.stockAlert || 5)).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="skeleton h-10 w-48 rounded-xl mb-6" />
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Mes produits</h1>
            <p className="text-slate-500 text-sm mt-1">
              {products.length} produit(s)
              {lowStock > 0 && <span className="ml-2 text-orange-600 font-semibold">· {lowStock} stock faible</span>}
              {outOfStock > 0 && <span className="ml-2 text-rose-700 font-semibold">· {outOfStock} épuisé(s)</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-800 w-44"
            />
            <Link href="/vendeur/produits/import"
              className="border border-slate-200 hover:border-rose-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition">
              ⬆️ Import CSV
            </Link>
            <Link href="/vendeur/produits/nouveau"
              className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2">
              + Nouveau produit
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📦</p>
              <p className="font-bold text-slate-700">{search ? `Aucun résultat pour "${search}"` : "Aucun produit"}</p>
              {!search && (
                <Link href="/vendeur/produits/nouveau" className="mt-4 inline-block text-rose-800 text-sm font-semibold hover:underline">
                  Créer votre premier produit →
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Top", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const isLow = p.stock > 0 && p.stock <= (p.stockAlert || 5);
                    const isOut = p.stock === 0;
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                : <span className="text-lg">📦</span>}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 max-w-[160px] truncate">{p.title}</p>
                              <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{p.category}</td>
                        <td className="px-5 py-3">
                          <p className="font-black text-rose-800">{Number(p.promoPrice || p.price).toFixed(2)} TND</p>
                          {p.promoPrice && <p className="text-xs text-slate-400 line-through">{Number(p.price).toFixed(2)}</p>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-semibold ${isOut ? "text-rose-700" : isLow ? "text-orange-600" : "text-slate-700"}`}>
                            {p.stock}
                          </span>
                          {isOut && <span className="ml-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">Épuisé</span>}
                          {isLow && !isOut && <span className="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Faible</span>}
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleActive(p)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full transition ${p.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {p.isActive ? "Actif" : "Inactif"}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleBestSeller(p)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full transition ${p.isBestSeller ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                            {p.isBestSeller ? "🏆 Top" : "Top"}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Link href={`/vendeur/produits/${p.id}/modifier`}
                              className="text-rose-700 hover:text-rose-900 text-xs font-semibold transition">
                              Modifier
                            </Link>
                            <button onClick={() => cloneProduct(p.id)}
                              className="text-slate-500 hover:text-slate-800 text-xs font-semibold transition" title="Dupliquer">
                              📋
                            </button>
                            <button onClick={() => handleDelete(p.id)}
                              className="text-slate-400 hover:text-rose-700 text-xs font-semibold transition">
                              Suppr.
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
