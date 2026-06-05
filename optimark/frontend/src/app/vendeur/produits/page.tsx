"use client";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: string;
  createdAt: string;
}

export default function VendeurProduitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "SELLER") {
        router.replace("/auth/connexion");
        return;
      }
      fetchProducts();
    }
  }, [user, loading]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/vendors/products");
      setProducts(res.data.data);
    } catch {
    } finally {
      setFetching(false);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, { isActive: !product.isActive });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Mes produits</h1>
          <button
            onClick={() => router.push("/vendeur/produits/nouveau")}
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            + Nouveau produit
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium">Aucun produit</p>
              <button
                onClick={() => router.push("/vendeur/produits/nouveau")}
                className="mt-4 text-blue-800 text-sm hover:underline"
              >
                Créer votre premier produit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Titre</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Catégorie</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Prix</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Stock</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Statut</th>
                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-blue-800">{product.price.toFixed(2)} TND</td>
                      <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                            product.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {product.isActive ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push(`/vendeur/produits/${product.id}/modifier`)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
