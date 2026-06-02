import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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

const ONGLETS = ['Système', 'Utilisateurs', 'Alertes'];

const NOTIFICATIONS_INITIALES = [
  { id: 1, onglet: 'Système', type: 'erreur', titre: 'Erreur serveur 502', message: 'Timeout sur le service de paiement — durée : 4 min', heure: '08:15', lu: false },
  { id: 2, onglet: 'Système', type: 'erreur', titre: 'Base de données lente', message: 'Temps de requête moyen > 2s depuis 30 minutes', heure: '09:42', lu: false },
  { id: 3, onglet: 'Système', type: 'kyc', titre: 'Déploiement réussi', message: 'Version 2.4.1 déployée en production avec succès', heure: '11:00', lu: true },
  { id: 4, onglet: 'Système', type: 'erreur', titre: 'Pic de charge détecté', message: 'CPU à 94% sur le nœud principal depuis 10 min', heure: '14:30', lu: false },
  { id: 5, onglet: 'Utilisateurs', type: 'user', titre: 'Nouvel inscrit', message: 'Ahmed Ben Salah vient de créer un compte prestataire', heure: '07:30', lu: false },
  { id: 6, onglet: 'Utilisateurs', type: 'user', titre: 'Nouvel inscrit', message: 'Sonia Trabelsi — compte client activé', heure: '08:55', lu: true },
  { id: 7, onglet: 'Utilisateurs', type: 'kyc', titre: 'KYC soumis', message: 'Karim Mansouri a soumis ses documents d\'identité', heure: '10:20', lu: false },
  { id: 8, onglet: 'Utilisateurs', type: 'kyc', titre: 'KYC soumis', message: 'Leila Chabbi attend validation depuis 2 jours', heure: '12:00', lu: false },
  { id: 9, onglet: 'Utilisateurs', type: 'user', titre: 'Compte suspendu', message: 'Mohamed Ezzine — signalé 3 fois par des clients', heure: '15:10', lu: true },
  { id: 10, onglet: 'Alertes', type: 'fraude', titre: 'Fraude détectée', message: 'Tentative de paiement multiple depuis IP 196.203.x.x', heure: '06:45', lu: false },
  { id: 11, onglet: 'Alertes', type: 'fraude', titre: 'Fraude potentielle', message: '5 annulations consécutives — compte ID #4821', heure: '09:10', lu: false },
  { id: 12, onglet: 'Alertes', type: 'erreur', titre: 'Activité suspecte', message: 'Connexions depuis 3 pays différents en moins de 1h', heure: '13:55', lu: false },
];

const ICONES = {
  erreur: '⚠️',
  user: '👤',
  fraude: '🔍',
  kyc: '✅',
};

export default function AdminNotificationsScreen({ navigation }) {
  const [ongletActif, setOngletActif] = useState('Système');
  const [notifications, setNotifications] = useState(NOTIFICATIONS_INITIALES);

  const notifsFiltrees = notifications.filter(n => n.onglet === ongletActif);
  const nonLusTotal = notifications.filter(n => !n.lu).length;
  const nonLusOnglet = notifsFiltrees.filter(n => !n.lu).length;

  function marquerToutLu() {
    setNotifications(prev =>
      prev.map(n => (n.onglet === ongletActif ? { ...n, lu: true } : n))
    );
  }

  function supprimerNotif(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function marquerLu(id) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, lu: true } : n))
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {nonLusTotal > 0 && (
          <View style={styles.badgeRouge}>
            <Text style={styles.badgeRougeText}>{nonLusTotal}</Text>
          </View>
        )}
      </View>

      <View style={styles.ongletBar}>
        {ONGLETS.map(o => {
          const count = notifications.filter(n => n.onglet === o && !n.lu).length;
          return (
            <TouchableOpacity
              key={o}
              style={[styles.ongletBtn, ongletActif === o && styles.ongletBtnActif]}
              onPress={() => setOngletActif(o)}
            >
              <Text style={[styles.ongletText, ongletActif === o && styles.ongletTextActif]}>
                {o}
              </Text>
              {count > 0 && (
                <View style={styles.ongletBadge}>
                  <Text style={styles.ongletBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Text style={styles.actionCount}>
          {nonLusOnglet > 0 ? `${nonLusOnglet} non lu(s)` : 'Tout est lu'}
        </Text>
        {nonLusOnglet > 0 && (
          <TouchableOpacity onPress={marquerToutLu}>
            <Text style={styles.actionBtn}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {notifsFiltrees.length === 0 && (
          <View style={styles.vide}>
            <Text style={styles.videText}>Aucune notification</Text>
          </View>
        )}
        {notifsFiltrees.map(n => (
          <View key={n.id} style={[styles.carte, !n.lu && styles.carteNonLue]}>
            <View style={styles.carteTop}>
              <Text style={styles.carteIcone}>{ICONES[n.type]}</Text>
              <View style={styles.carteContent}>
                <View style={styles.carteTitleRow}>
                  <Text style={styles.carteTitre}>{n.titre}</Text>
                  {!n.lu && <View style={styles.pointNonLu} />}
                </View>
                <Text style={styles.carteMessage}>{n.message}</Text>
                <Text style={styles.carteHeure}>{n.heure}</Text>
              </View>
            </View>
            <View style={styles.carteBtns}>
              {!n.lu && (
                <TouchableOpacity style={styles.btnLu} onPress={() => marquerLu(n.id)}>
                  <Text style={styles.btnLuText}>Marquer lu</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnSuppr} onPress={() => supprimerNotif(n.id)}>
                <Text style={styles.btnSupprText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRouge: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeRougeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ongletBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  ongletBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  ongletBtnActif: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  ongletText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  ongletTextActif: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  ongletBadge: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  ongletBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionCount: {
    color: COLORS.muted,
    fontSize: 13,
  },
  actionBtn: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  vide: {
    alignItems: 'center',
    paddingTop: 60,
  },
  videText: {
    color: COLORS.muted,
    fontSize: 15,
  },
  carte: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  carteNonLue: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  carteTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  carteIcone: {
    fontSize: 22,
    marginTop: 2,
  },
  carteContent: {
    flex: 1,
  },
  carteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  carteTitre: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  pointNonLu: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  carteMessage: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  carteHeure: {
    color: COLORS.border,
    fontSize: 11,
  },
  carteBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  btnLu: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnLuText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  btnSuppr: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E5393520',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  btnSupprText: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: '600',
  },
});
