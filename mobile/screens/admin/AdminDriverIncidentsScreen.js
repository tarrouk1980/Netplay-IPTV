import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Modal, ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  amber: '#F57C00',
  amberLight: '#FFA726',
  blue: '#1565C0',
  blueLight: '#42A5F5',
  purple: '#6A1B9A',
  purpleLight: '#AB47BC',
};

const MOCK_INCIDENTS = [
  {
    id: '1',
    type: 'ACCIDENT',
    chauffeur: 'Mohamed Ben Ali',
    client: 'Sonia Trabelsi',
    date: '2026-05-30 14:22',
    statut: 'OUVERT',
    description: 'Collision légère lors d\'un créneau. Dommages mineurs sur le pare-chocs avant. Aucun blessé.',
  },
  {
    id: '2',
    type: 'PANNE',
    chauffeur: 'Karim Zouari',
    client: 'Amine Chakroun',
    date: '2026-05-29 09:05',
    statut: 'EN_COURS',
    description: 'Panne moteur sur l\'autoroute A1. Le client a dû attendre 45 minutes. Un autre chauffeur a pris le relais.',
  },
  {
    id: '3',
    type: 'CONFLIT',
    chauffeur: 'Fatma Riahi',
    client: 'Hédi Mansour',
    date: '2026-05-28 18:47',
    statut: 'RÉSOLU',
    description: 'Désaccord sur le tarif appliqué. Le client contestait la majoration de soirée. Remboursement partiel effectué.',
  },
  {
    id: '4',
    type: 'AUTRE',
    chauffeur: 'Raouf Hamdi',
    client: 'Leila Belhaj',
    date: '2026-05-27 11:30',
    statut: 'OUVERT',
    description: 'Objet oublié dans le véhicule (sac à main). Le chauffeur n\'a pas répondu aux appels du client.',
  },
  {
    id: '5',
    type: 'ACCIDENT',
    chauffeur: 'Nabil Garrach',
    client: 'Yasmine Korbi',
    date: '2026-05-26 07:15',
    statut: 'EN_COURS',
    description: 'Accrochage avec un scooter à un carrefour. Rapport de police en cours. Assurance contactée.',
  },
];

const FILTRES = ['TOUS', 'OUVERT', 'EN_COURS', 'RÉSOLU'];

const TYPE_CONFIG = {
  ACCIDENT: { label: 'Accident', color: COLORS.accentLight },
  PANNE: { label: 'Panne', color: COLORS.amberLight },
  CONFLIT: { label: 'Conflit', color: COLORS.purpleLight },
  AUTRE: { label: 'Autre', color: COLORS.blueLight },
};

const STATUT_CONFIG = {
  OUVERT: { label: 'Ouvert', bg: '#3B1111', text: COLORS.accentLight },
  EN_COURS: { label: 'En cours', bg: '#2B1E00', text: COLORS.amberLight },
  RÉSOLU: { label: 'Résolu', bg: '#0D2B0D', text: COLORS.greenLight },
};

export default function AdminDriverIncidentsScreen({ navigation }) {
  const [filtre, setFiltre] = useState('TOUS');
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [selected, setSelected] = useState(null);

  const displayed = filtre === 'TOUS' ? incidents : incidents.filter((i) => i.statut === filtre);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  function resoudre(id) {
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, statut: 'RÉSOLU' } : i));
    setSelected(null);
    Alert.alert('Incident résolu', 'L\'incident a été marqué comme résolu.');
  }

  function escalader(id) {
    Alert.alert('Escalade', 'L\'incident a été transmis au responsable régional.', [
      { text: 'OK', onPress: () => setSelected(null) },
    ]);
  }

  function renderItem({ item }) {
    const typeConf = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.AUTRE;
    const statutConf = STATUT_CONFIG[item.statut];
    return (
      <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
        <View style={s.cardHeader}>
          <View style={[s.typeBadge, { borderColor: typeConf.color }]}>
            <Text style={[s.typeBadgeText, { color: typeConf.color }]}>{typeConf.label}</Text>
          </View>
          <View style={[s.statutBadge, { backgroundColor: statutConf.bg }]}>
            <Text style={[s.statutBadgeText, { color: statutConf.text }]}>{statutConf.label}</Text>
          </View>
        </View>
        <View style={s.cardBody}>
          <View style={s.personRow}>
            <Text style={s.personLabel}>Chauffeur</Text>
            <Text style={s.personValue}>{item.chauffeur}</Text>
          </View>
          <View style={s.personRow}>
            <Text style={s.personLabel}>Client</Text>
            <Text style={s.personValue}>{item.client}</Text>
          </View>
        </View>
        <Text style={s.dateText}>{item.date}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={s.header}>
        <Text style={s.headerTitle}>Incidents signalés</Text>
        <View style={[s.countBadge, { backgroundColor: COLORS.accent }]}>
          <Text style={s.countText}>{displayed.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtreScroll}
      >
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filtreBtn, filtre === f && s.filtreBtnActive]}
            onPress={() => setFiltre(f)}
            activeOpacity={0.8}
          >
            <Text style={[s.filtreBtnText, filtre === f && s.filtreBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Aucun incident pour ce filtre</Text>
          </View>
        }
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            {selected && (
              <>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Détail de l'incident</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Text style={s.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={s.modalSection}>
                    <View style={[s.typeBadge, { borderColor: TYPE_CONFIG[selected.type]?.color ?? COLORS.muted }]}>
                      <Text style={[s.typeBadgeText, { color: TYPE_CONFIG[selected.type]?.color ?? COLORS.muted }]}>
                        {TYPE_CONFIG[selected.type]?.label ?? selected.type}
                      </Text>
                    </View>
                    <View style={[s.statutBadge, { backgroundColor: STATUT_CONFIG[selected.statut].bg, marginTop: 8 }]}>
                      <Text style={[s.statutBadgeText, { color: STATUT_CONFIG[selected.statut].text }]}>
                        {STATUT_CONFIG[selected.statut].label}
                      </Text>
                    </View>
                  </View>
                  <View style={s.modalRow}>
                    <Text style={s.modalLabel}>Chauffeur</Text>
                    <Text style={s.modalValue}>{selected.chauffeur}</Text>
                  </View>
                  <View style={s.modalRow}>
                    <Text style={s.modalLabel}>Client</Text>
                    <Text style={s.modalValue}>{selected.client}</Text>
                  </View>
                  <View style={s.modalRow}>
                    <Text style={s.modalLabel}>Date</Text>
                    <Text style={s.modalValue}>{selected.date}</Text>
                  </View>
                  <Text style={s.descTitle}>Description</Text>
                  <Text style={s.descText}>{selected.description}</Text>
                  <View style={s.photosBox}>
                    <Text style={s.photosLabel}>Photos</Text>
                    <View style={s.photosRow}>
                      {[1, 2, 3].map((n) => (
                        <View key={n} style={s.photoPlaceholder}>
                          <Text style={s.photoIcon}>📷</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
                <View style={s.modalActions}>
                  {selected.statut !== 'RÉSOLU' && (
                    <TouchableOpacity style={s.btnResoudre} onPress={() => resoudre(selected.id)} activeOpacity={0.85}>
                      <Text style={s.btnResoudreText}>Résoudre</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.btnEscalader} onPress={() => escalader(selected.id)} activeOpacity={0.85}>
                    <Text style={s.btnEscaladerText}>Escalader</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 },
  countBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  filtreScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtreBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  filtreBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filtreBtnText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  filtreBtnTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  statutBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statutBadgeText: { fontSize: 12, fontWeight: '700' },
  cardBody: { gap: 6, marginBottom: 8 },
  personRow: { flexDirection: 'row', justifyContent: 'space-between' },
  personLabel: { fontSize: 13, color: COLORS.muted },
  personValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  dateText: { fontSize: 12, color: COLORS.muted },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.muted, padding: 4 },
  modalSection: { marginBottom: 14 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  modalLabel: { fontSize: 14, color: COLORS.muted },
  modalValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  descTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  descText: { fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 16 },
  photosBox: { marginBottom: 16 },
  photosLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  photosRow: { flexDirection: 'row', gap: 10 },
  photoPlaceholder: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  photoIcon: { fontSize: 28 },
  modalActions: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  btnResoudre: {
    flex: 1, backgroundColor: COLORS.green, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnResoudreText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  btnEscalader: {
    flex: 1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent,
  },
  btnEscaladerText: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
});
