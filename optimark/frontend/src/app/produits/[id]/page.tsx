import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MOCK_REVIEWS = [
  { id: 1, author: "Sami B.", rating: 5, comment: "Produit excellent, conforme à la description. Livraison rapide.", date: "15 mai 2025" },
  { id: 2, author: "Rania M.", rating: 4, comment: "Très bon rapport qualité/prix. Je recommande ce vendeur.", date: "3 mai 2025" },
  { id: 3, author: "Youssef K.", rating: 5, comment: "Parfait ! Je suis très satisfait de mon achat.", date: "22 avril 2025" },
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2">
            <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center mb-4">
              <span className="text-8xl">📦</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg h-16 flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-800 transition">
                  <span className="text-2xl">📦</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div>
              <span className="text-xs text-blue-700 font-medium uppercase tracking-wide">Électronique</span>
              <h1 className="text-2xl font-bold text-slate-800 mt-1">Smartphone Samsung Galaxy A54 — 128Go</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-blue-800">1 299,99 TND</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">TechStore TN</span>
              <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Vérifié</span>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < 4 ? "text-yellow-400 text-lg" : "text-slate-200 text-lg"}>★</span>
              ))}
              <span className="text-slate-500 text-sm ml-1">4.5/5 (42 avis)</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Le Samsung Galaxy A54 offre une expérience premium à un prix accessible. Écran Super AMOLED 6.4&quot;, triple caméra 50MP, batterie 5000mAh. Disponible en noir, blanc et violet.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button className="flex-1 bg-blue-800 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                Acheter maintenant
              </button>
              <button className="flex-1 border-2 border-blue-800 text-blue-800 font-bold py-3 rounded-xl hover:bg-blue-50 transition">
                Ajouter au panier
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
              <p>✅ Livraison disponible partout en Tunisie</p>
              <p>✅ Paiement sécurisé (Konnect, Paymee, Cash)</p>
              <p>✅ Retour sous 7 jours</p>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Avis clients</h2>
          <div className="space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-800 text-sm">
                      {review.author.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">{review.author}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-400" : "text-slate-200"}>★</span>
                  ))}
                </div>
                <p className="text-slate-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
