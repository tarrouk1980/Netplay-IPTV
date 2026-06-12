import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="max-w-md">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-5xl font-black text-slate-900 mb-3">404</h1>
          <p className="text-xl font-bold text-slate-700 mb-2">Page introuvable</p>
          <p className="text-slate-500 mb-8">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="bg-rose-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-rose-900 transition">
              Retour à l&apos;accueil
            </Link>
            <Link href="/produits" className="border-2 border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl hover:border-rose-300 hover:text-rose-800 transition">
              Voir les produits
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/services" className="text-rose-800 hover:underline">Services</Link>
            <Link href="/ventes-flash" className="text-rose-800 hover:underline">⚡ Ventes flash</Link>
            <Link href="/live" className="text-rose-800 hover:underline">🔴 Live</Link>
            <Link href="/pricing" className="text-rose-800 hover:underline">Tarifs</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
