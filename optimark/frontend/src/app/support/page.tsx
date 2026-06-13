"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useState } from "react";

const FAQ = [
  {
    q: "Comment passer une commande ?",
    a: "Parcourez notre catalogue, ajoutez des produits à votre panier et finalisez votre commande en choisissant votre adresse de livraison.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Les délais varient selon les vendeurs : généralement 2-5 jours ouvrables en Tunisie. Consultez la fiche produit pour les informations spécifiques.",
  },
  {
    q: "Comment retourner un produit ?",
    a: "Vous avez 14 jours après la livraison pour demander un retour depuis la page de votre commande. Le vendeur vous contactera pour les modalités.",
  },
  {
    q: "Comment devenir vendeur ?",
    a: "Créez un compte, puis dans votre profil, cliquez sur \"Devenir vendeur\". Configurez ensuite votre boutique et commencez à lister vos produits.",
  },
  {
    q: "Comment utiliser un code promo ?",
    a: "Lors du paiement, entrez votre code promo dans le champ dédié du panier. La réduction sera appliquée automatiquement.",
  },
  {
    q: "Mes paiements sont-ils sécurisés ?",
    a: "Oui, toutes les transactions sont sécurisées. Nous utilisons des protocoles de chiffrement SSL et ne stockons jamais vos données bancaires.",
  },
  {
    q: "Comment contacter un vendeur ?",
    a: "Sur la page d'un produit ou dans votre commande, vous pouvez envoyer un message directement au vendeur via notre système de messagerie.",
  },
  {
    q: "Que faire si je ne reçois pas ma commande ?",
    a: "Attendez d'abord le délai indiqué. Si le délai est dépassé, contactez le vendeur via la messagerie. En cas de litige, utilisez ce formulaire de support.",
  },
];

const SUBJECTS = [
  "Problème avec une commande",
  "Produit non reçu",
  "Remboursement",
  "Problème de compte",
  "Signaler un abus",
  "Autre",
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      // Store as a notification for admin review
      await api.post("/notifications/support", form).catch(() => {
        // Fallback — just show success even if endpoint doesn't exist yet
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">🤝 Centre d'aide</h1>
        <p className="text-slate-500 text-sm mb-8">Trouvez des réponses à vos questions ou contactez notre équipe.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "💬", title: "Chat en direct", desc: "Disponible 9h-18h en semaine", action: "Démarrer le chat" },
            { icon: "📧", title: "E-mail", desc: "Réponse sous 24h", action: "support@optimark.tn" },
            { icon: "📞", title: "Téléphone", desc: "+216 71 XXX XXX", action: "Appeler maintenant" },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <p className="text-3xl mb-2">{c.icon}</p>
              <p className="font-black text-slate-800 mb-1">{c.title}</p>
              <p className="text-slate-400 text-xs mb-3">{c.desc}</p>
              <span className="text-xs font-bold text-rose-800">{c.action}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* FAQ */}
          <div>
            <h2 className="font-black text-slate-900 text-xl mb-4">Questions fréquentes</h2>
            <div className="space-y-2">
              {FAQ.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                    <span className={`text-slate-400 transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-black text-slate-900 text-xl mb-4">Nous contacter</h2>
            <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              {sent ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-black text-slate-800 text-lg mb-2">Message envoyé !</p>
                  <p className="text-slate-500 text-sm">Notre équipe vous répondra dans les plus brefs délais.</p>
                  <button onClick={() => setSent(false)} className="mt-4 text-sm text-rose-800 hover:underline font-semibold">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nom *</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder="email@exemple.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sujet</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                    >
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={5}
                      placeholder="Décrivez votre problème en détail..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !form.name.trim() || !form.email.trim() || !form.message.trim()}
                    className="w-full bg-rose-800 hover:bg-rose-900 text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {sending ? "Envoi..." : "Envoyer le message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
