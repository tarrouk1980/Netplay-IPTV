"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useRef, useState } from "react";

const CSV_TEMPLATE = `title,description,price,promoPrice,category,stock,brand,stockAlert
"Écouteurs Bluetooth","Son cristallin, autonomie 20h",89.99,69.99,ELECTRONIQUE,50,Samsung,5
"Chaussures de sport","Confort et performance",129.00,,MODE,30,Nike,3`;

function parseCSV(text: string): Record<string, any>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const v = vals[i]?.trim() || "";
      obj[h.trim()] = ["price", "promoPrice", "stock", "stockAlert"].includes(h.trim())
        ? (v ? Number(v) : (h.trim() === "promoPrice" ? null : 0))
        : v || undefined;
    });
    return obj;
  }).filter(r => r.title && r.price);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQ = !inQ; }
    else if (line[i] === ',' && !inQ) { result.push(cur); cur = ""; }
    else { cur += line[i]; }
  }
  result.push(cur);
  return result;
}

export default function ImporterPage() {
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: number } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setError("Aucune ligne valide trouvée. Vérifiez le format CSV."); setPreview([]); return; }
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post("/products/bulk", { products: preview });
      const data = res.data.data as any[];
      setResult({ created: data.length, errors: preview.length - data.length });
      setPreview([]);
    } catch {
      setError("Erreur lors de l'importation.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "template-produits.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">📤 Importer des produits</h1>
        <p className="text-slate-500 text-sm mb-8">Importez plusieurs produits en une fois via un fichier CSV</p>

        {/* Template download */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-blue-800 text-sm">📄 Téléchargez le modèle CSV</p>
            <p className="text-blue-600 text-xs mt-0.5">Colonnes : title, description, price, promoPrice, category, stock, brand, stockAlert</p>
          </div>
          <button onClick={downloadTemplate} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
            Télécharger le modèle
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-12 text-center cursor-pointer transition mb-6 bg-white"
        >
          <p className="text-4xl mb-3">📂</p>
          <p className="font-bold text-slate-700 mb-1">Glissez votre fichier CSV ici</p>
          <p className="text-slate-400 text-sm">ou cliquez pour choisir un fichier</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}

        {result && (
          <div className={`rounded-xl px-5 py-4 mb-6 border ${result.errors === 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
            <p className={`font-bold text-sm ${result.errors === 0 ? "text-green-800" : "text-amber-800"}`}>
              ✅ {result.created} produit(s) importé(s) avec succès
              {result.errors > 0 && ` — ⚠️ ${result.errors} erreur(s)`}
            </p>
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-800">Aperçu — {preview.length} produit(s)</h2>
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-rose-800 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50"
              >
                {importing ? "Importation..." : "✓ Importer tout"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Titre", "Prix", "Promo", "Catégorie", "Stock", "Marque"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{p.title}</td>
                      <td className="px-4 py-3 text-rose-800 font-bold">{Number(p.price).toFixed(2)} TND</td>
                      <td className="px-4 py-3 text-slate-500">{p.promoPrice ? `${Number(p.promoPrice).toFixed(2)} TND` : "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.stock ?? 0}</td>
                      <td className="px-4 py-3 text-slate-500">{p.brand || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
