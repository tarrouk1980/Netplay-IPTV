import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const ARTICLES = [
  { id: 1, nom: 'Lait entier Vitalait 1L', quantite: 2, prix: 3.2, couleur: '#4A90D9' },
  { id: 2, nom: 'Pain de mie complet', quantite: 1, prix: 2.8, couleur: '#C8A96E' },
  { id: 3, nom: 'Yaourt Délice nature x4', quantite: 1, prix: 4.5, couleur: '#E8E8E8' },
  { id: 4, nom: 'Jus d\'orange Ruspina 1L', quantite: 3, prix: 2.6, couleur: '#F5A623' },
];

const CRENEAUX = [
  { id: 'rapide', label: 'Dans 30 min', detail: 'Livraison express', surcharge: 2.5 },
  { id: 'soir', label: 'Ce soir 18h–20h', detail: 'Créneau standard', surcharge: 0 },
  { id: 'demain', label: 'Demain matin', detail: '8h–10h', surcharge: 0 },
];

const PROMO_VALIDE = 'EASY10';
const PROMO_REDUCTION = 3.0;

const ADRESSE = {
  nom: 'Domicile',
  ligne: '12, Rue Ibn Khaldoun',
  ville: 'Tunis 1002',
};

export default function GroceryCheckoutReviewScreen({ navigation }) {
  const [creneauChoisi, setCreneauChoisi] = useState('soir');
  const [codePromo, setCodePromo] = useState('');
  const [promoAppliquee, setPromoAppliquee] = useState(false);
  const [erreurPromo, setErreurPromo] = useState('');

  const sousTotal = ARTICLES.reduce((acc, a) => acc + a.prix * a.quantite, 0);
  const creneau = CRENEAUX.find(c => c.id === creneauChoisi);
  const fraisLivraison = 1.5 + (creneau ? creneau.surcharge : 0);
  const reduction = promoAppliquee ? PROMO_REDUCTION : 0;
  const total = sousTotal + fraisLivraison - reduction;

  function appliquerPromo() {
    if (codePromo.trim().toUpperCase() === PROMO_VALIDE) {
      setPromoAppliquee(true);
      setErreurPromo('');
    } else {
      setPromoAppliquee(false);
      setErreurPromo('Code promo invalide ou expiré');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Révision de la commande</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles ({ARTICLES.length})</Text>
          {ARTICLES.map(a => (
            <View key={a.id} style={styles.articleRow}>
              <View style={[styles.articleImage, { backgroundColor: a.couleur }]} />
              <View style={styles.articleInfo}>
                <Text style={styles.articleNom}>{a.nom}</Text>
                <Text style={styles.articleQte}>Qté : {a.quantite}</Text>
              </View>
              <Text style={styles.articlePrix}>
                {(a.prix * a.quantite).toFixed(2)} DT
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            <TouchableOpacity>
              <Text style={styles.modifierBtn}>Modifier</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.adresseCard}>
            <Text style={styles.adresseNom}>{ADRESSE.nom}</Text>
            <Text style={styles.adresseLigne}>{ADRESSE.ligne}</Text>
            <Text style={styles.adresseLigne}>{ADRESSE.ville}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créneau de livraison</Text>
          {CRENEAUX.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.creneauRow, creneauChoisi === c.id && styles.creneauRowActif]}
              onPress={() => setCreneauChoisi(c.id)}
            >
              <View style={[styles.radio, creneauChoisi === c.id && styles.radioActif]}>
                {creneauChoisi === c.id && <View style={styles.radioDot} />}
              </View>
              <View style={styles.creneauInfo}>
                <Text style={[styles.creneauLabel, creneauChoisi === c.id && styles.creneauLabelActif]}>
                  {c.label}
                </Text>
                <Text style={styles.creneauDetail}>{c.detail}</Text>
              </View>
              {c.surcharge > 0 && (
                <Text style={styles.creneauSurcharge}>+{c.surcharge.toFixed(2)} DT</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code promo</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrer le code"
              placeholderTextColor={COLORS.muted}
              value={codePromo}
              onChangeText={v => { setCodePromo(v); setErreurPromo(''); }}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoBtn} onPress={appliquerPromo}>
              <Text style={styles.promoBtnText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
          {erreurPromo !== '' && <Text style={styles.promoErreur}>{erreurPromo}</Text>}
          {promoAppliquee && (
            <Text style={styles.promoSucces}>Code EASY10 appliqué — –{PROMO_REDUCTION.toFixed(2)} DT</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.ligneFinanciere}>
            <Text style={styles.ligneLabel}>Sous-total</Text>
            <Text style={styles.ligneValeur}>{sousTotal.toFixed(2)} DT</Text>
          </View>
          <View style={styles.ligneFinanciere}>
            <Text style={styles.ligneLabel}>Frais de livraison</Text>
            <Text style={styles.ligneValeur}>{fraisLivraison.toFixed(2)} DT</Text>
          </View>
          {promoAppliquee && (
            <View style={styles.ligneFinanciere}>
              <Text style={styles.ligneLabel}>Réduction promo</Text>
              <Text style={[styles.ligneValeur, { color: '#4CAF50' }]}>
                -{reduction.toFixed(2)} DT
              </Text>
            </View>
          )}
          <View style={[styles.ligneFinanciere, styles.ligneTotalSep]}>
            <Text style={styles.ligneTotalLabel}>Total</Text>
            <Text style={styles.ligneTotalValeur}>{total.toFixed(2)} DT</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payerBtn}
          onPress={() => navigation.navigate('KonnectPayment')}
        >
          <Text style={styles.payerBtnText}>Payer maintenant — {total.toFixed(2)} DT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingRight: 12,
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 28,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modifierBtn: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  articleImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  articleInfo: {
    flex: 1,
  },
  articleNom: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  articleQte: {
    color: COLORS.muted,
    fontSize: 12,
  },
  articlePrix: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  adresseCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adresseNom: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  adresseLigne: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  creneauRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 12,
  },
  creneauRowActif: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5A62310',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActif: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  creneauInfo: {
    flex: 1,
  },
  creneauLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  creneauLabelActif: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  creneauDetail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  creneauSurcharge: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '600',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  promoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  promoBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  promoErreur: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 6,
  },
  promoSucces: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  ligneFinanciere: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ligneLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  ligneValeur: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  ligneTotalSep: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  ligneTotalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ligneTotalValeur: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  payerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payerBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
