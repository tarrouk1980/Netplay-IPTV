import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";

const MOCK_SERVICES = [
  { id: "1", title: "Création de site web professionnel WordPress ou Next.js", provider: "DevTN Studio", startingPrice: 300, rating: 4.8, category: "Développement web", isVerified: true },
  { id: "2", title: "Design logo + identité visuelle complète", provider: "Créa Graphik", startingPrice: 150, rating: 4.7, category: "Design", isVerified: true },
  { id: "3", title: "Gestion réseaux sociaux Facebook & Instagram", provider: "SocialMedia Pro", startingPrice: 200, rating: 4.5, category: "Marketing", isVerified: false },
  { id: "4", title: "Traduction arabe / français / anglais", provider: "Polyglotte TN", startingPrice: 30, rating: 4.9, category: "Traduction", isVerified: true },
  { id: "5", title: "Développement application mobile React Native", provider: "AppDev Tunis", startingPrice: 800, rating: 4.6, category: "Développement mobile", isVerified: true },
  { id: "6", title: "Rédaction de contenu SEO en français et arabe", provider: "ContentWriter", startingPrice: 50, rating: 4.4, category: "Rédaction", isVerified: false },
];

const CATEGORIES = ["Tous", "Développement web", "Design", "Marketing", "Traduction", "Développement mobile", "Rédaction"];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Services & Freelance</h1>
          <p className="text-slate-500">Trouvez des prestataires tunisiens qualifiés pour vos projets.</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un service..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                cat === "Tous"
                  ? "bg-blue-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SERVICES.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
