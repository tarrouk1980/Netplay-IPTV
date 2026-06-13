"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CSV_TEMPLATE = `title,description,price,promoPrice,category,brand,stock,images
"Produit exemple","Description du produit",99.99,,Électronique,Apple,50,https://example.com/img.jpg
"Autre produit","Une autre description",149.99,129.99,Mode,Nike,20,`;

const REQUIRED_COLS = ["title", "price", "category", "stock"];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || [];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/"/g, "").trim(); });
    return obj;
  }).filter(r => r.title);
}

export default function BulkImportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) router.push("/");
  }, [user, authLoading, router]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const missing = REQUIRED_COLS.filter(col => rows[0] && !(col in rows[0]));
      if (missing.length) { setError(`Colonnes manquantes : ${missing.join(", ")}`); return; }
      setError("");
      setPreview(rows.slice(0, 20));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    setError("");
    try {
      const products = preview.map(row => ({
        title: row.title,
        description: row.description || "",
        price: parseFloat(row.price) || 0,
        promoPrice: row.promoPrice ? parseFloat(row.promoPrice) : undefined,
        category: row.category,
        brand: row.brand || undefined,
        stock: parseInt(row.stock) || 0,
        images: row.images ? [row.images] : [],
      }));
      const res = await api.post("/products/bulk", { products });
      setResult({ created: res.data?.data?.length || 0 });
      setPreview([]);
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-produits-optimark.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/vendeur/produits" className="text-slate-500 hover:text-slate-700 text-sm">← Mes produits</Link>
          <h1 className="text-2xl font-black text-slate-900">Import en masse</h1>
        </div>

        {result ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-xl font-black text-green-800 mb-2">{result.created} produit(s) importé(s) avec succès</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/vendeur/produits" className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
                Voir mes produits →
              </Link>
              <button onClick={() => setResult(null)} className="border border-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition">
                Importer encore
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Instructions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 className="font-black text-slate-800 mb-4">📋 Instructions</h2>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <span>Téléchargez le modèle CSV et remplissez vos produits</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <span>Les colonnes <code className="bg-slate-100 px-1 rounded text-xs">title</code>, <code className="bg-slate-100 px-1 rounded text-xs">price</code>, <code className="bg-slate-100 px-1 rounded text-xs">category</code> et <code className="bg-slate-100 px-1 rounded text-xs">stock</code> sont obligatoires</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <span>Importez votre fichier CSV et vérifiez la prévisualisation</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-black text-xs shrink-0">4</span>
                  <span>Cliquez sur "Importer" pour créer tous vos produits en une fois</span>
                </li>
              </ol>
              <button onClick={downloadTemplate}
                className="mt-6 w-full border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2">
                ⬇️ Télécharger le modèle CSV
              </button>
            </div>

            {/* Right: Upload */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 className="font-black text-slate-800 mb-4">📁 Importer un fichier</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-10 text-center cursor-pointer transition mb-4">
                <p className="text-4xl mb-3">📄</p>
                <p className="font-semibold text-slate-600">Cliquez ou glissez votre fichier CSV</p>
                <p className="text-slate-400 text-xs mt-1">Format: CSV, UTF-8</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              {error && <p className="text-rose-700 text-sm bg-rose-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
              {preview.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-700 mb-2">{preview.length} produit(s) prêt(s) à importer</p>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-48">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          {Object.keys(preview[0]).map(h => <th key={h} className="px-3 py-2 text-left text-slate-500 font-semibold">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-slate-50">
                            {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-slate-600 truncate max-w-[100px]">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.length > 5 && <p className="text-xs text-slate-400 mt-1">... et {preview.length - 5} autre(s)</p>}
                  <button onClick={handleImport} disabled={importing}
                    className="mt-4 w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50">
                    {importing ? "Importation en cours..." : `Importer ${preview.length} produit(s) →`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
