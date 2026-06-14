"use client";

import { useState, useRef, useEffect } from "react";

const FAQS: { question: string; keywords: string[]; answer: string }[] = [
  { question: "Comment suivre ma commande ?", keywords: ["suivi", "commande", "livraison", "où"], answer: "Rendez-vous dans **Mes commandes** pour suivre l'état de votre commande en temps réel. Vous recevez aussi des notifications à chaque étape." },
  { question: "Comment retourner un produit ?", keywords: ["retour", "rembours", "annuler", "défectueux"], answer: "Allez dans **Mes retours** depuis votre compte. Vous pouvez soumettre une demande de retour pour toute commande livrée sous 14 jours." },
  { question: "Comment payer ?", keywords: ["payer", "paiement", "carte", "edinar", "virement"], answer: "OPTIMARK accepte les cartes bancaires, e-DINAR, et le virement. Choisissez votre méthode à la validation du panier." },
  { question: "Comment devenir vendeur ?", keywords: ["vendre", "vendeur", "boutique", "créer"], answer: "Depuis votre profil, cliquez sur **Devenir vendeur**. Votre espace vendeur sera immédiatement activé et vous pourrez ajouter vos produits." },
  { question: "Comment utiliser les points fidélité ?", keywords: ["points", "fidélité", "loyauté", "échanger"], answer: "Vous gagnez 10 points par TND dépensé. 100 points = 1 TND de réduction. Échangez depuis **Points fidélité** dans votre profil." },
  { question: "Comment contacter un vendeur ?", keywords: ["contact", "message", "vendeur", "envoyer"], answer: "Depuis la page produit, cliquez sur **Contacter le vendeur**. Vos échanges apparaissent dans la section **Messages**." },
  { question: "Comment signaler un problème ?", keywords: ["problème", "signaler", "aide", "support", "service client"], answer: "Contactez-nous via la page **Support** ou envoyez un email à support@optimark.tn. Réponse sous 24h." },
  { question: "Comment utiliser un code promo ?", keywords: ["code promo", "coupon", "réduction", "discount"], answer: "Entrez votre code promo dans le champ prévu à la validation du panier. La réduction s'applique automatiquement." },
];

type Msg = { from: "user" | "bot"; text: string };

function findAnswer(q: string) {
  const lower = q.toLowerCase();
  const match = FAQS.find(f => f.keywords.some(k => lower.includes(k)));
  return match?.answer || "Je n'ai pas de réponse précise à cette question. Consultez notre **page Support** ou contactez-nous directement à support@optimark.tn.";
}

function BotMessage({ text }: { text: string }) {
  const html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Bonjour ! 👋 Je suis l'assistant OPTIMARK. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const q = text ?? input.trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { from: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      const answer = findAnswer(q);
      setMessages(prev => [...prev, { from: "bot", text: answer }]);
      setTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-rose-800 text-white rounded-full shadow-lg hover:bg-rose-900 transition z-50 flex items-center justify-center text-2xl"
        aria-label="Support"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          style={{ maxHeight: "480px" }}>
          {/* Header */}
          <div className="bg-rose-800 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="font-black text-sm">Assistant OPTIMARK</p>
              <p className="text-rose-200 text-xs">En ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "280px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "user" ? "bg-rose-800 text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"}`}>
                  {m.from === "bot" ? <BotMessage text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2 text-slate-400 text-sm">
                  <span className="animate-pulse">●●●</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 border-t border-slate-50">
            <div className="flex flex-wrap gap-1.5">
              {["Suivi commande", "Retourner", "Points fidélité"].map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-rose-50 text-rose-800 font-semibold px-2.5 py-1 rounded-full hover:bg-rose-100 transition">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-100">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Posez votre question..."
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-300"
            />
            <button onClick={() => send()}
              className="bg-rose-800 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-rose-900 transition">
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
