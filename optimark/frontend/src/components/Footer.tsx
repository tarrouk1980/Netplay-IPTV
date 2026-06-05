import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-black text-white mb-3">
              <span className="text-crimson-light">OPTI</span>MARK
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              La marketplace tunisienne de référence. Achetez et vendez en toute confiance.
            </p>
            <div className="flex gap-3">
              {["f", "in", "tw"].map((s) => (
                <a key={s} href="#" className="w-9 h-9 bg-slate-800 hover:bg-crimson rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white transition-all duration-200">
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Navigation</p>
            <ul className="space-y-2.5 text-sm">
              {[["Accueil", "/"], ["Produits", "/produits"], ["Services", "/services"], ["Live", "/live"], ["Tarifs", "/pricing"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-crimson-light transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Compte</p>
            <ul className="space-y-2.5 text-sm">
              {[["Connexion", "/auth/connexion"], ["S'inscrire", "/auth/inscription"], ["Mon panier", "/panier"], ["Dashboard vendeur", "/vendeur/dashboard"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-crimson-light transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="mailto:contact@optimark.tn" className="hover:text-crimson-light transition">contact@optimark.tn</a></li>
              <li className="text-slate-500">Tunis, Tunisie 🇹🇳</li>
            </ul>
            <div className="mt-5 p-3 bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">Paiements sécurisés</p>
              <div className="flex gap-2">
                {["Konnect", "Paymee"].map((p) => (
                  <span key={p} className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded-lg">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} OPTIMARK. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition text-xs">Confidentialité</a>
            <a href="#" className="hover:text-slate-400 transition text-xs">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
