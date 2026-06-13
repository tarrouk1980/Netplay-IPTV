"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  PAID: "Payé",
  REJECTED: "Rejeté",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export default function VirementsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: "", bankName: "", rib: "", accountHolder: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchPayouts = () => {
    api.get("/payouts/my")
      .then(r => setPayouts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayouts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Montant invalide."); return; }
    if (!form.rib || !form.bankName || !form.accountHolder) { setError("Veuillez remplir tous les champs bancaires."); return; }
    setSubmitting(true);
    try {
      await api.post("/payouts", {
        amount: parseFloat(form.amount),
        bankInfo: { bankName: form.bankName, rib: form.rib, accountHolder: form.accountHolder },
      });
      setSuccess("Demande de virement soumise avec succès !");
      setForm({ amount: "", bankName: "", rib: "", accountHolder: "" });
      fetchPayouts();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">💸 Demandes de virement</h1>
        <p className="text-slate-500 text-sm mb-8">Soumettez une demande de virement de vos revenus</p>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2 className="font-black text-slate-800 mb-4">Nouvelle demande</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Montant (TND)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Ex: 500.00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Banque</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                  placeholder="Ex: STB, BNA, Attijari..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">RIB</label>
                <input
                  type="text"
                  value={form.rib}
                  onChange={e => setForm(f => ({ ...f, rib: e.target.value }))}
                  placeholder="Ex: 20-018-0000000000-00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Titulaire du compte</label>
                <input
                  type="text"
                  value={form.accountHolder}
                  onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))}
                  placeholder="Nom complet"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            {error && <p className="text-rose-600 text-sm font-medium">{error}</p>}
            {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Soumettre la demande"}
              </button>
            </div>
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">Historique des demandes</h2>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">{[...Array(3)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">💸</p>
              <p>Aucune demande pour l&apos;instant</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Montant", "Banque", "RIB", "Statut", "Note admin", "Date"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-black text-rose-800">{Number(p.amount).toFixed(2)} TND</td>
                      <td className="px-5 py-4 text-slate-700">{p.bankInfo?.bankName || "—"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.bankInfo?.rib || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}>
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{p.adminNote || "—"}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
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
