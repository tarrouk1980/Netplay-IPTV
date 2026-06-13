"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SellerFaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/store-faq/my")
      .then(r => setFaqs(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.patch(`/store-faq/${editingId}`, form);
        setFaqs(prev => prev.map(f => f.id === editingId ? res.data.data : f));
      } else {
        const res = await api.post("/store-faq", form);
        setFaqs(prev => [...prev, res.data.data]);
      }
      setForm({ question: "", answer: "" });
      setShowForm(false);
      setEditingId(null);
    } catch { } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette FAQ ?")) return;
    await api.delete(`/store-faq/${id}`).catch(() => {});
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const startEdit = (faq: any) => {
    setForm({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id);
    setShowForm(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link href="/vendeur/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-1">❓ FAQ de ma boutique</h1>
            <p className="text-slate-500 text-sm mt-0.5">Ces questions/réponses s'affichent sur votre boutique publique.</p>
          </div>
          <button onClick={() => { setShowForm(v => !v); setEditingId(null); setForm({ question: "", answer: "" }); }}
            className="bg-rose-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
            + Nouvelle FAQ
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 className="font-black text-slate-800 mb-4">{editingId ? "Modifier la FAQ" : "Nouvelle question"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Question *</label>
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="Ex: Faites-vous la livraison express ?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Réponse *</label>
                <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  placeholder="Oui, nous livrons en 24h dans tout le Grand Tunis..." rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving || !form.question.trim() || !form.answer.trim()}
                  className="bg-rose-800 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-rose-900 transition disabled:opacity-50">
                  {saving ? "Sauvegarde..." : editingId ? "Mettre à jour" : "Ajouter"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 text-sm hover:underline">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {faqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">❓</p>
            <p className="font-bold text-slate-700 mb-1">Aucune FAQ</p>
            <p className="text-slate-400 text-sm">Ajoutez des questions fréquentes pour rassurer vos clients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.id} className="bg-white rounded-xl border border-slate-100 p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{i + 1}. {faq.question}</p>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(faq)} className="text-xs text-slate-400 hover:text-rose-700 transition px-2 py-1 rounded-lg hover:bg-rose-50">✏️</button>
                    <button onClick={() => remove(faq.id)} className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
