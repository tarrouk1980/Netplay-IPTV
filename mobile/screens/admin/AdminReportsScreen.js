import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';

import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
};

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: COLORS.amber, bg: '#F57C0022' },
  RESOLVED: { label: 'Résolu', color: COLORS.green, bg: '#2E7D3222' },
  DISMISSED: { label: 'Ignoré', color: COLORS.muted, bg: '#8A8A9A22' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ReportCard({ item, onResolve, onDismiss, onDetail }) {
  const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
  const reasons = Array.isArray(item.reasons) ? item.reasons : [];

  return (
    <View style={card.container}>
      <View style={card.header}>
        <View style={card.names}>
          <Text style={card.signalant}>
            <Text style={card.labelMuted}>Signalant: </Text>
            {item.reporter?.name || `#${(item.reporterId || '').slice(-6)}`}
          </Text>
          <Text style={card.signale}>
            <Text style={card.labelMuted}>Signalé: </Text>
            {item.reported?.name || `#${(item.reportedId || '').slice(-6)}`}
            {item.reported?.role ? <Text style={card.role}>  [{item.reported.role}]</Text> : null}
          </Text>
        </View>
        <View style={[card.badge, { backgroundColor: sc.bg, borderColor: sc.color }]}>
          <Text style={[card.badgeTxt, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </View>

      {reasons.length > 0 && (
        <View style={card.reasons}>
          {reasons.map((r, i) => (
            <View key={i} style={card.reasonTag}>
              <Text style={card.reasonTxt}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {item.details ? (
        <Text style={card.details} numberOfLines={2}>{item.details}</Text>
      ) : null}

      <Text style={card.date}>{formatDate(item.createdAt)}</Text>

      {item.status === 'PENDING' && (
        <View style={card.actions}>
          <TouchableOpacity style={[card.btn, card.btnResolve]} onPress={() => onResolve(item)}>
            <Text style={card.btnTxt}>Résoudre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[card.btn, card.btnDismiss]} onPress={() => onDismiss(item)}>
            <Text style={[card.btnTxt, { color: COLORS.muted }]}>Ignorer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[card.btn, card.btnDetail]} onPress={() => onDetail(item)}>
            <Text style={[card.btnTxt, { color: COLORS.blue }]}>Détail</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status !== 'PENDING' && (
        <TouchableOpacity onPress={() => onDetail(item)}>
          <Text style={card.viewDetail}>Voir détail ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  names: { flex: 1, gap: 4 },
  signalant: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  signale: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  labelMuted: { color: COLORS.muted, fontWeight: '400' },
  role: { color: COLORS.muted, fontSize: 11 },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  reasonTag: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  reasonTxt: { color: COLORS.accent, fontSize: 11 },
  details: { color: COLORS.muted, fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  date: { color: COLORS.muted, fontSize: 11, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnResolve: { backgroundColor: COLORS.green + '22', borderColor: COLORS.green },
  btnDismiss: { backgroundColor: COLORS.surfaceAlt, borderColor: COLORS.border },
  btnDetail: { backgroundColor: COLORS.blue + '22', borderColor: COLORS.blue },
  btnTxt: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  viewDetail: { color: COLORS.blue, fontSize: 12, marginTop: 4, textAlign: 'right' },
});

function DetailModal({ visible, report, onClose }) {
  if (!report) return null;
  const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const reasons = Array.isArray(report.reasons) ? report.reasons : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Détail du signalement</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={modal.scroll} showsVerticalScrollIndicator={false}>
            <View style={modal.row}>
              <Text style={modal.label}>Statut</Text>
              <Text style={[modal.value, { color: sc.color }]}>{sc.label}</Text>
            </View>
            <View style={modal.row}>
              <Text style={modal.label}>Signalant</Text>
              <Text style={modal.value}>
                {report.reporter?.name || '—'} — {report.reporter?.phone || ''}
              </Text>
            </View>
            <View style={modal.row}>
              <Text style={modal.label}>Signalé</Text>
              <Text style={modal.value}>
                {report.reported?.name || '—'} — {report.reported?.phone || ''}
                {report.reported?.role ? `  (${report.reported.role})` : ''}
              </Text>
            </View>
            <View style={modal.row}>
              <Text style={modal.label}>Date</Text>
              <Text style={modal.value}>{formatDate(report.createdAt)}</Text>
            </View>
            {report.orderId && (
              <View style={modal.row}>
                <Text style={modal.label}>Commande</Text>
                <Text style={modal.value}>#{report.orderId.slice(-8)}</Text>
              </View>
            )}
            {reasons.length > 0 && (
              <View style={modal.block}>
                <Text style={modal.label}>Motifs</Text>
                {reasons.map((r, i) => (
                  <Text key={i} style={modal.bullet}>• {r}</Text>
                ))}
              </View>
            )}
            {report.details ? (
              <View style={modal.block}>
                <Text style={modal.label}>Détails</Text>
                <Text style={modal.details}>{report.details}</Text>
              </View>
            ) : null}
            {report.adminNote ? (
              <View style={modal.block}>
                <Text style={modal.label}>Note admin</Text>
                <Text style={modal.details}>{report.adminNote}</Text>
              </View>
            ) : null}
            {report.resolvedAt && (
              <View style={modal.row}>
                <Text style={modal.label}>Résolu le</Text>
                <Text style={modal.value}>{formatDate(report.resolvedAt)}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnTxt}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  close: { color: COLORS.muted, fontSize: 20 },
  scroll: { padding: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border + '66' },
  block: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border + '66' },
  label: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  value: { color: COLORS.white, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  bullet: { color: COLORS.white, fontSize: 13, marginTop: 4 },
  details: { color: COLORS.white, fontSize: 13, marginTop: 4, lineHeight: 20 },
  closeBtn: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

const TABS = [
  { key: 'PENDING', label: 'En attente' },
  { key: 'RESOLVED', label: 'Résolus' },
];

export default function AdminReportsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailReport, setDetailReport] = useState(null);

  const fetchReports = useCallback(async (status = activeTab, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get(`/api/reports/admin?status=${status}`);
      setReports(res.data || []);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible de charger les signalements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReports([]);
  };

  const updateReport = async (id, status, adminNote = '') => {
    try {
      await api.patch(`/api/reports/admin/${id}`, { status, adminNote });
      fetchReports(activeTab);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Mise à jour échouée');
    }
  };

  const handleResolve = (item) => {
    Alert.prompt
      ? Alert.prompt(
          'Résoudre',
          'Note admin (optionnel)',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Résoudre', onPress: (note) => updateReport(item.id, 'RESOLVED', note || '') },
          ],
          'plain-text'
        )
      : Alert.alert('Résoudre le signalement', `Signalement de ${item.reporter?.name || 'inconnu'} contre ${item.reported?.name || 'inconnu'}`, [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Résoudre', onPress: () => updateReport(item.id, 'RESOLVED') },
        ]);
  };

  const handleDismiss = (item) => {
    Alert.alert(
      'Ignorer le signalement',
      `Êtes-vous sûr de vouloir ignorer ce signalement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ignorer', style: 'destructive', onPress: () => updateReport(item.id, 'DISMISSED') },
      ]
    );
  };

  const exportCSV = async () => {
    try {
      if (!reports || reports.length === 0) {
        Alert.alert('Aucune donnée', 'Aucun rapport à exporter.');
        return;
      }
      const headers = 'ID,Signaleur,Signalé,Raison,Statut,Date\n';
      const rows = reports.map(r => {
        const reasons = Array.isArray(r.reasons) ? r.reasons.join('|') : (r.reasons || '');
        const reporter = r.reporter?.name || r.reporterName || '';
        const reported = r.reported?.name || r.reportedName || '';
        const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('fr-TN') : '';
        return [r.id, reporter, reported, reasons, r.status || '', date]
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(',');
      }).join('\n');
      const csv = headers + rows;
      const fileUri = FileSystem.documentDirectory + `rapports_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Exporter les rapports' });
      } else {
        Alert.alert('Fichier créé', fileUri);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  const renderItem = ({ item }) => (
    <ReportCard
      item={item}
      onResolve={handleResolve}
      onDismiss={handleDismiss}
      onDetail={setDetailReport}
    />
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Signalements</Text>
        <TouchableOpacity onPress={exportCSV} style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>📊 CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={[styles.tabTxt, activeTab === tab.key && styles.tabTxtActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && reports.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loaderTxt}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReports(activeTab, true)}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyTxt}>Aucun signalement {activeTab === 'PENDING' ? 'en attente' : 'résolu'}</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <DetailModal
        visible={!!detailReport}
        report={detailReport}
        onClose={() => setDetailReport(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  backTxt: { color: COLORS.white, fontSize: 22 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.accent },
  tabTxt: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  tabTxtActive: { color: COLORS.white },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderTxt: { color: COLORS.muted, fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTxt: { color: COLORS.muted, fontSize: 15 },
  exportBtn: {
    backgroundColor: '#1565C022',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1565C044',
  },
  exportBtnText: { color: '#42A5F5', fontSize: 12, fontWeight: '700' },
});
