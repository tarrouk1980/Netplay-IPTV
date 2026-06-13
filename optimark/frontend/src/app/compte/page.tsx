"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  ADMIN: "Administrateur",
};

export default function ComptePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<any>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "", street: "", city: "", zip: "", phone: "", isDefault: false });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/auth/connexion?redirect=/compte");
    else {
      api.get("/returns/loyalty").then(r => setLoyalty(r.data?.data)).catch(() => {});
      api.get("/addresses").then(r => setAddresses(r.data?.data || [])).catch(() => {});
    }
  }, [user, loading, router]);

  const saveAddress = async () => {
    if (!addrForm.label.trim() || !addrForm.street.trim() || !addrForm.city.trim()) return;
    setSavingAddr(true);
    try {
      const res = await api.post("/addresses", addrForm);
      setAddresses(prev => addrForm.isDefault ? [res.data.data, ...prev.map(a => ({ ...a, isDefault: false }))] : [res.data.data, ...prev]);
      setShowAddrForm(false);
      setAddrForm({ label: "", street: "", city: "", zip: "", phone: "", isDefault: false });
    } catch { } finally { setSavingAddr(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Supprimer cette adresse ?")) return;
    await api.delete(`/addresses/${id}`).catch(() => {});
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefault = async (id: string) => {
    await api.patch(`/addresses/${id}`, { isDefault: true }).catch(() => {});
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const redeem = async () => {
    if (!loyalty || loyalty.points < 100) return;
    setRedeeming(true);
    try {
      const res = await api.post("/returns/loyalty/redeem", { points: 100 });
      alert(`✓ 100 points échangés = ${res.data?.data?.discountTND} TND de réduction sur votre prochaine commande.`);
      api.get("/returns/loyalty").then(r => setLoyalty(r.data?.data)).catch(() => {});
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          <div className="skeleton rounded-2xl h-48" />
        </main>
        <Footer />
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Mon compte</h1>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-rose-800 text-white flex items-center justify-center text-2xl font-black shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{user.name}</p>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 mt-1">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Adresse e-mail</dt>
              <dd className="font-semibold text-slate-800">{user.email}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Téléphone</dt>
              <dd className="font-semibold text-slate-800">{user.phone || "Non renseigné"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Statut de vérification</dt>
              <dd className={`font-semibold ${user.isVerified ? "text-green-600" : "text-amber-600"}`}>
                {user.isVerified ? "Vérifié" : "En attente de vérification"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/commandes"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="font-bold text-slate-800">Mes commandes</p>
              <p className="text-slate-500 text-xs">Suivez vos achats et leur livraison</p>
            </div>
          </Link>

          <Link
            href="/favoris"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">♥</span>
            <div>
              <p className="font-bold text-slate-800">Mes favoris</p>
              <p className="text-slate-500 text-xs">Vos produits sauvegardés</p>
            </div>
          </Link>

          <Link
            href="/boutiques-suivies"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🔔</span>
            <div>
              <p className="font-bold text-slate-800">Boutiques suivies</p>
              <p className="text-slate-500 text-xs">Vos vendeurs favoris</p>
            </div>
          </Link>

          <Link
            href="/listes"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">📋</span>
            <div>
              <p className="font-bold text-slate-800">Mes listes</p>
              <p className="text-slate-500 text-xs">Listes personnalisées de produits</p>
            </div>
          </Link>

          <Link
            href="/loyalte"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-bold text-slate-800">Points fidélité</p>
              <p className="text-slate-500 text-xs">{loyalty?.points ?? "—"} points disponibles</p>
            </div>
          </Link>

          <Link
            href="/alertes-prix"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🔔</span>
            <div>
              <p className="font-bold text-slate-800">Alertes de prix</p>
              <p className="text-slate-500 text-xs">Soyez notifié quand un prix baisse</p>
            </div>
          </Link>

          <Link
            href="/parrainage"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-green-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🤝</span>
            <div>
              <p className="font-bold text-slate-800">Parrainage</p>
              <p className="text-slate-500 text-xs">Invitez vos amis, gagnez 200 pts</p>
            </div>
          </Link>

          <Link
            href="/cartes-cadeaux"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🎁</span>
            <div>
              <p className="font-bold text-slate-800">Cartes cadeaux</p>
              <p className="text-slate-500 text-xs">Achetez ou offrez une carte cadeau</p>
            </div>
          </Link>

          <Link
            href="/compte/securite"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🔒</span>
            <div>
              <p className="font-bold text-slate-800">Sécurité</p>
              <p className="text-slate-500 text-xs">Changer le mot de passe, modifier le profil</p>
            </div>
          </Link>

          <Link
            href="/notifications"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">🔔</span>
            <div>
              <p className="font-bold text-slate-800">Notifications</p>
              <p className="text-slate-500 text-xs">Commandes et mises à jour</p>
            </div>
          </Link>

          <Link
            href="/mes-avis"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">⭐</span>
            <div>
              <p className="font-bold text-slate-800">Mes avis</p>
              <p className="text-slate-500 text-xs">Vos évaluations de produits et services</p>
            </div>
          </Link>

          <Link
            href="/commandes?tab=returns"
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-3xl">↩️</span>
            <div>
              <p className="font-bold text-slate-800">Mes retours</p>
              <p className="text-slate-500 text-xs">Demandes de retour et remboursements</p>
            </div>
          </Link>

          {user.role === "SELLER" && (
            <Link
              href="/vendeur/dashboard"
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-rose-300 transition"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <span className="text-3xl">🏪</span>
              <div>
                <p className="font-bold text-slate-800">Tableau de bord vendeur</p>
                <p className="text-slate-500 text-xs">Gérez vos produits et ventes</p>
              </div>
            </Link>
          )}
        </div>

        {/* Loyalty */}
        {loyalty && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="font-black text-amber-800 text-lg">{loyalty.points} points fidélité</p>
                  <p className="text-amber-600 text-xs">≈ {loyalty.valueInTND} TND · 1 point par TND dépensé</p>
                </div>
              </div>
              {loyalty.points >= 100 && (
                <button onClick={redeem} disabled={redeeming}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                  {redeeming ? "..." : "Échanger 100 pts"}
                </button>
              )}
            </div>
            {loyalty.points < 100 && (
              <p className="text-amber-600 text-xs mt-2">Il vous faut {100 - loyalty.points} points de plus pour échanger.</p>
            )}
          </div>
        )}

        {/* Address Book */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800">📍 Carnet d'adresses</h2>
            <button onClick={() => setShowAddrForm(v => !v)} className="text-sm font-bold text-rose-800 hover:underline">+ Ajouter</button>
          </div>
          {showAddrForm && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Libellé (ex: Maison)" value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Rue *" value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Ville *" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Code postal" value={addrForm.zip} onChange={e => setAddrForm(f => ({ ...f, zip: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Téléphone" value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} className="accent-rose-800" />
                Adresse par défaut
              </label>
              <div className="flex gap-2">
                <button onClick={saveAddress} disabled={savingAddr} className="bg-rose-800 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-rose-900 transition disabled:opacity-50">
                  {savingAddr ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button onClick={() => setShowAddrForm(false)} className="text-slate-500 text-sm hover:underline">Annuler</button>
              </div>
            </div>
          )}
          {addresses.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Aucune adresse enregistrée</p>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr.id} className={`flex items-start justify-between p-3 rounded-xl border ${addr.isDefault ? "border-rose-200 bg-rose-50" : "border-slate-100"}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{addr.label}</span>
                      {addr.isDefault && <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Défaut</span>}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{addr.street}, {addr.city}{addr.zip ? ` ${addr.zip}` : ""}</p>
                    {addr.phone && <p className="text-slate-400 text-xs">📞 {addr.phone}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-xs text-rose-700 hover:underline">Par défaut</button>}
                    <button onClick={() => deleteAddress(addr.id)} className="text-xs text-slate-400 hover:text-red-500">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="text-rose-700 font-semibold text-sm hover:underline"
        >
          Se déconnecter
        </button>
      </main>

      <Footer />
    </div>
  );
}
