import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-2xl font-extrabold text-white mb-3">OPTIMARK</p>
          <p className="text-slate-400 text-sm">La marketplace tunisienne de référence. Achetez et vendez en toute confiance.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Navigation</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
            <li><Link href="/produits" className="hover:text-white transition">Produits</Link></li>
            <li><Link href="/services" className="hover:text-white transition">Services</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Compte</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/auth/connexion" className="hover:text-white transition">Connexion</Link></li>
            <li><Link href="/auth/inscription" className="hover:text-white transition">S&apos;inscrire</Link></li>
            <li><Link href="/panier" className="hover:text-white transition">Mon panier</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:contact@optimark.tn" className="hover:text-white transition">contact@optimark.tn</a></li>
            <li><span>Tunis, Tunisie</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-slate-700 mt-10 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} OPTIMARK. Tous droits réservés.
      </div>
    </footer>
  );
}
