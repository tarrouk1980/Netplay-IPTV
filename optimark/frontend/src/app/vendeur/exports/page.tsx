"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendeurExportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") router.replace("/auth/connexion");
  }, [user, loading, router]);

  const exportFile = async (type: "orders" | "products") => {
    setExporting(type);
    setDone(null);
    try {
      const res = await api.get(`/vendors/export-${type}-csv`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(type);
    } catch {
      alert("Erreur lors de l'export.");
    } finally {
      setExporting(null);
    }
  };

  if (loading) return null;

  const EXPORTS = [
    {
      id: "orders" as const,
      title: "Commandes",
      icon: "📦",
      desc: "Exportez toutes vos commandes avec les détails client, produits, montants et statuts.",
      fields: ["ID", "Date", "Client", "Produits", "Total", "Statut", "Adresse livraison"],
      color: "rose",
    },
    {
      id: "products" as const,
      title: "Catalogue produits",
      icon: "🛍️",
      desc: "Exportez votre catalogue complet avec prix, stock, catégories et statistiques.",
      fields: ["ID", "Titre", "Catégorie", "Prix", "Prix promo", "Stock", "Statut", "Vues"],
      color: "indigo",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900">📤 Exports de données</h1>
        </div>

        <p className="text-slate-500 text-sm mb-6">
          Téléchargez vos données au format CSV pour les analyser dans Excel, Google Sheets ou tout autre outil.
        </p>

        <div className="space-y-4 mb-8">
          {EXPORTS.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{exp.icon}</span>
                    <h2 className="font-black text-slate-900">{exp.title}</h2>
                    {done === exp.id && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Téléchargé</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mb-3">{exp.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.fields.map(f => (
                      <span key={f} className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{f}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => exportFile(exp.id)}
                  disabled={exporting === exp.id}
                  className="shrink-0 bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {exporting === exp.id ? "Export..." : "⬇ Télécharger CSV"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 mb-2">💡 Conseils d'utilisation</h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• Ouvrez le fichier CSV avec <strong>Excel</strong> en choisissant l'encodage UTF-8</li>
            <li>• Dans Google Sheets, utilisez Fichier → Importer et sélectionnez votre CSV</li>
            <li>• Les montants sont en <strong>dinars tunisiens (TND)</strong></li>
            <li>• Les dates sont au format ISO 8601 (AAAA-MM-JJ)</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
