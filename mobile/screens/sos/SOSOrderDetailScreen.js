import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABEL = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};
const STATUS_COLOR = {
  PENDING: COLORS.orange,
  ACCEPTED: COLORS.blue,
  IN_PROGRESS: COLORS.green,
  COMPLETED: COLORS.green,
  CANCELLED: COLORS.accent,
};

const PROBLEM_ICONS = {
  PANNE: '🔧',
  ACCIDENT: '💥',
  PNEU: '🛞',
  BATTERIE: '🔋',
  REMORQUAGE: '⛓',
  CARBURANT: '⛽',
  AUTRE: '🛻',
};

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
    </View>
  );
}

function Timeline({ currentStatus, cancelled }) {
  if (cancelled) {
    return (
      <View style={{ padding: 14 }}>
        <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 14 }}>❌ Intervention annulée</Text>
      </View>
    );
  }
  const idx = STATUS_STEPS.indexOf(currentStatus);
  return (
    <View style={t.wrap}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <View key={step} style={t.row}>
            <View style={t.left}>
              <View style={[t.dot, done && t.dotDone, active && t.dotActive]} />
              {i < STATUS_STEPS.length - 1 && <View style={[t.line, done && t.lineDone]} />}
            </View>
            <Text style={[t.label, done && t.labelDone, active && t.labelActive]}>
              {STATUS_LABEL[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const t = StyleSheet.create({
  wrap: { paddingLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  left: { alignItems: 'center', width: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border },
  dotDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  dotActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  line: { width: 2, height: 28, backgroundColor: COLORS.border },
  lineDone: { backgroundColor: COLORS.green },
  label: { color: COLORS.muted, fontSize: 13, marginLeft: 10, marginBottom: 16 },
  labelDone: { color: COLORS.text },
  labelActive: { color: COLORS.orange, fontWeight: '700' },
});

export default function SOSOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order || res.data);
    } catch {
      Alert.alert('Erreur', 'Intervention introuvable.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      await api.patch(`/api/sos/orders/${orderId}/status`, { status: newStatus });
      load();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Erreur serveur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCallClient = () => {
    if (order?.client?.phone) Linking.openURL(`tel:${order.client.phone}`);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );
  }
  if (!order) return null;

  const meta = order.metadata || {};
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const statusColor = STATUS_COLOR[order.status] || COLORS.muted;
  const problemIcon = PROBLEM_ICONS[meta.problemType?.toUpperCase?.()] || '🛻';

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🛻 Intervention #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={[s.status, { color: statusColor }]}>● {STATUS_LABEL[order.status] || order.status}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Problem type */}
        <View style={s.problemCard}>
          <Text style={{ fontSize: 44 }}>{problemIcon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.problemType}>{meta.problemType || 'Panne'}</Text>
            <Text style={s.problemDate}>
              {new Date(order.createdAt).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[s.statusBadgeTxt, { color: statusColor }]}>{STATUS_LABEL[order.status]}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Progression</Text>
          <View style={s.card}>
            <Timeline currentStatus={order.status} cancelled={isCancelled} />
          </View>
        </View>

        {/* Client info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Client</Text>
          <View style={s.card}>
            <Row label="Nom" value={order.client?.name} />
            <Row label="Téléphone" value={order.client?.phone} />
            {meta.location && <Row label="Position" value={meta.location} />}
            {meta.vehicleModel && <Row label="Véhicule" value={meta.vehicleModel} />}
            {meta.licensePlate && <Row label="Immatriculation" value={meta.licensePlate} />}
            {order.client?.phone && (
              <TouchableOpacity style={s.callBtn} onPress={handleCallClient}>
                <Text style={s.callBtnTxt}>📞 Appeler le client</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Description */}
        {meta.description && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Description du problème</Text>
            <View style={s.card}>
              <Text style={s.description}>{meta.description}</Text>
            </View>
          </View>
        )}

        {/* Pre-diagnostic answers */}
        {meta.diagnostic && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pré-diagnostic</Text>
            <View style={s.card}>
              {Object.entries(meta.diagnostic).map(([k, v]) => (
                <Row key={k} label={k} value={String(v)} />
              ))}
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Facturation</Text>
          <View style={s.card}>
            <Row label="Montant" value={`${parseFloat(order.price || 0).toFixed(3)} TND`} valueColor={COLORS.green} />
            <Row label="Paiement" value={meta.paymentMethod || 'Cash'} />
            {order.tip > 0 && <Row label="Pourboire" value={`${parseFloat(order.tip).toFixed(3)} TND`} valueColor={COLORS.orange} />}
          </View>
        </View>

        {/* Provider actions */}
        {!isCancelled && !isCompleted && (
          <View style={s.actionsSection}>
            {order.status === 'ACCEPTED' && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: COLORS.blue }]}
                onPress={() => handleStatusChange('IN_PROGRESS')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'IN_PROGRESS' ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.actionBtnTxt}>🔧 Démarrer l'intervention</Text>}
              </TouchableOpacity>
            )}
            {order.status === 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: COLORS.green }]}
                onPress={() => handleStatusChange('COMPLETED')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'COMPLETED' ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.actionBtnTxt}>✅ Terminer l'intervention</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCompleted && (
          <View style={s.actionsSection}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={() => navigation.navigate('Invoice', { orderId })}>
              <Text style={[s.actionBtnTxt, { color: COLORS.text }]}>🧾 Voir la facture</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  status: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  problemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  problemType: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  problemDate: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusBadgeTxt: { fontSize: 11, fontWeight: '700' },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  callBtn: { backgroundColor: COLORS.blue + '22', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue, marginTop: 4 },
  callBtnTxt: { color: COLORS.blue, fontWeight: '700', fontSize: 13 },
  description: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  actionsSection: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  actionBtn: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  actionBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
