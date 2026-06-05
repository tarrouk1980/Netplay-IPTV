import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

const plans = [
  {
    name: "Gratuit",
    price: 0,
    description: "Parfait pour débuter",
    badge: null,
    features: [
      "10 produits max",
      "Commission 10%",
      "Support communautaire",
      "Accès à la marketplace",
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/auth/inscription",
    highlight: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "Pour les vendeurs actifs",
    badge: "Pro",
    features: [
      "100 produits",
      "Commission 7%",
      "Badge Pro",
      "Analytics basiques",
      "Support email",
    ],
    cta: "Passer au Pro",
    ctaHref: "/auth/inscription?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: 99,
    description: "Pour les pros du commerce",
    badge: "Vérifié Premium",
    features: [
      "Produits illimités",
      "Commission 5%",
      "Badge Vérifié Premium",
      "Analytics avancés",
      "Live commerce",
      "Support prioritaire 24/7",
    ],
    cta: "Passer au Business",
    ctaHref: "/auth/inscription?plan=business",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 px-4 bg-gradient-to-br from-blue-800 to-blue-600 text-white text-center">
          <h1 className="text-4xl font-extrabold mb-4">Tarifs transparents</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Choisissez le plan qui correspond à votre activité. Pas de frais cachés.
          </p>
        </section>

        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-md flex flex-col overflow-hidden border-2 transition ${
                  plan.highlight ? "border-blue-800 shadow-xl scale-105" : "border-slate-200"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-blue-800 text-white text-xs font-bold text-center py-1.5 tracking-wide uppercase">
                    Recommandé
                  </div>
                )}
                <div className="p-8 flex-1">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-1">{plan.name}</h2>
                  {plan.badge && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 ml-1">TND / mois</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-700 text-sm">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border-t border-slate-100">
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full text-center font-bold py-3 rounded-xl transition ${
                      plan.highlight
                        ? "bg-blue-800 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-16 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Besoin d&apos;une offre sur mesure ?</h3>
            <p className="text-slate-500 mb-6">
              Vous avez un volume important ou des besoins spécifiques ? Contactez notre équipe commerciale.
            </p>
            <Link href="mailto:contact@optimark.tn" className="bg-blue-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
              Nous contacter
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
