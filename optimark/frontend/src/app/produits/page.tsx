import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const MOCK_PRODUCTS = [
  { id: "1", title: "Smartphone Samsung Galaxy A54", price: 1299.99, seller: "TechStore TN", rating: 4.5, isVerified: true, category: "Électronique" },
  { id: "2", title: "Robe traditionnelle brodée à la main", price: 189.00, seller: "Artisanat Sfax", rating: 4.8, isVerified: true, category: "Mode" },
  { id: "3", title: "Chaise en bois d'olivier artisanale", price: 450.00, seller: "Menuiserie Nabeul", rating: 4.2, isVerified: false, category: "Maison" },
  { id: "4", title: "Huile d'olive extra vierge 5L", price: 65.00, seller: "Ferme Bio Sfax", rating: 4.9, isVerified: true, category: "Alimentation" },
  { id: "5", title: "Laptop HP 15 Core i5 8Go RAM", price: 2199.00, seller: "ElectroShop", rating: 4.3, isVerified: true, category: "Électronique" },
  { id: "6", title: "Tapis berbère fait main 200x300", price: 780.00, seller: "Artisanat Kairouan", rating: 4.7, isVerified: true, category: "Décoration" },
];

const CATEGORIES = ["Tous", "Électronique", "Mode", "Maison", "Alimentation", "Décoration", "Sport"];

export default function ProduitsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Produits</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
              <div>
                <p className="font-semibold text-slate-700 mb-3">Catégorie</p>
                <ul className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-blue-800">
                        <input type="checkbox" className="accent-blue-800" />
                        {cat}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-3">Prix (TND)</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800" />
                  <input type="number" placeholder="Max" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-blue-800">
                  <input type="checkbox" className="accent-green-600" />
                  <span className="text-green-700 font-medium">✓ Vendeurs vérifiés</span>
                </label>
              </div>

              <button className="w-full bg-blue-800 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition">
                Appliquer
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm">{MOCK_PRODUCTS.length} produits trouvés</p>
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-800">
                <option>Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Mieux notés</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
