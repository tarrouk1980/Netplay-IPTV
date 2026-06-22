import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STEPS = [
  { key: 'ACCEPTED', label: 'Commande acceptée', icon: '✅' },
  { key: 'IN_PROGRESS', label: 'En livraison', icon: '🛵' },
  { key: 'COMPLETED', label: 'Livraison effectuée', icon: '🎉' },
];

export default function LivreurTaskScreen({ navigation, route }) {
  const taskId = route?.params?.taskId;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!taskId) { setError(true); setLoading(false); return; }
    api.get(`/api/orders/${taskId}`)
      .then(r => {
        const o = r.data.order;
        setTask({
          id: o.id,
          orderRef: '#' + o.id,
          client: { name: o.client?.name || 'Client', address: o.destinationAddress || '', phone: o.client?.phone || '', notes: o.metadata?.notes || '' },
          items: o.metadata?.items || [],
          deliveryFee: Number(o.finalPrice ?? o.price ?? 0),
          tip: Number(o.metadata?.tip || 0),
          currentStep: o.status,
        });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [taskId]);

  const currentStepIdx = task ? STEPS.findIndex(s => s.key === task.currentStep) : 0;

  const handleNextStep = async () => {
    if (!task || currentStepIdx >= STEPS.length - 1) return;
    const nextStep = STEPS[currentStepIdx + 1];

    if (nextStep.key === 'COMPLETED') {
      Alert.alert('Confirmer la livraison ?', 'Marquer cette commande comme livrée ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => advanceStep(nextStep.key) },
      ]);
      return;
    }
    advanceStep(nextStep.key);
  };

  const advanceStep = async (stepKey) => {
    setUpdating(true);
    const endpoint = stepKey === 'IN_PROGRESS' ? 'pickup' : 'complete';
    try {
      await api.post(`/api/delivery/${task.id}/${endpoint}`);
      setTask(prev => ({ ...prev, currentStep: stepKey }));
      if (stepKey === 'COMPLETED') {
        Alert.alert('🎉 Livraison confirmée !', `+${(task.deliveryFee + task.tip).toFixed(3)} TND crédités sur votre portefeuille.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la livraison. Vérifiez votre connexion.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = (phone) => Linking.openURL(`tel:${phone}`).catch(() => {});

  const handleOpenMap = (address) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {});
  };

  const nextStep = currentStepIdx < STEPS.length - 1 ? STEPS[currentStepIdx + 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛵 En livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de charger cette livraison.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

            {/* Progress */}
            <View style={styles.progressCard}>
              {STEPS.map((step, i) => {
                const done = i < currentStepIdx;
                const active = i === currentStepIdx;
                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepCircle, done && { backgroundColor: COLORS.green }, active && { backgroundColor: COLORS.accent }]}>
                        <Text style={{ fontSize: 12 }}>{done ? '✓' : step.icon}</Text>
                      </View>
                      {i < STEPS.length - 1 && <View style={[styles.stepLine, done && { backgroundColor: COLORS.green }]} />}
                    </View>
                    <Text style={[styles.stepLabel, active && { color: COLORS.accent, fontWeight: '800' }, done && { color: COLORS.green }]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Order info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>COMMANDE</Text>
              <View style={styles.infoCard}>
                <Text style={styles.orderRef}>{task.orderRef}</Text>
                {task.items.map((item, i) => (
                  <Text key={i} style={styles.itemRow}>• {item.qty > 1 ? `${item.qty}× ` : ''}{item.name}</Text>
                ))}
              </View>
            </View>

            {/* Client */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CLIENT (LIVRAISON)</Text>
              <View style={styles.contactCard}>
                <Text style={styles.contactName}>👤 {task.client.name}</Text>
                <Text style={styles.contactAddr}>{task.client.address}</Text>
                {!!task.client.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>💬 {task.client.notes}</Text>
                  </View>
                )}
                <View style={styles.contactActions}>
                  <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(task.client.phone)}>
                    <Text style={styles.callBtnText}>📞 Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mapBtn} onPress={() => handleOpenMap(task.client.address)}>
                    <Text style={styles.mapBtnText}>🗺️ Naviguer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Earnings */}
            <View style={styles.earningsCard}>
              <View style={styles.earningRow}>
                <Text style={styles.earningLabel}>Frais de livraison</Text>
                <Text style={styles.earningVal}>{task.deliveryFee.toFixed(3)} TND</Text>
              </View>
              <View style={styles.earningRow}>
                <Text style={styles.earningLabel}>Pourboire</Text>
                <Text style={[styles.earningVal, { color: COLORS.green }]}>+{task.tip.toFixed(3)} TND</Text>
              </View>
              <View style={[styles.earningRow, { marginTop: 6 }]}>
                <Text style={{ color: COLORS.text, fontWeight: '900', fontSize: 14 }}>Total à percevoir</Text>
                <Text style={{ color: COLORS.accent, fontWeight: '900', fontSize: 16 }}>{(task.deliveryFee + task.tip).toFixed(3)} TND</Text>
              </View>
              <Text style={styles.commissionNote}>✅ 0% commission EasyWay</Text>
            </View>
          </ScrollView>

          {nextStep && task.currentStep !== 'COMPLETED' && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextBtn, updating && { opacity: 0.6 }]}
                onPress={handleNextStep}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator color="#000" />
                  : <Text style={styles.nextBtnText}>{nextStep.icon} {nextStep.label}</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  progressCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, height: 24, backgroundColor: COLORS.border, marginVertical: 3 },
  stepLabel: { color: COLORS.muted, fontSize: 13, paddingTop: 5, flex: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  orderRef: { color: COLORS.accent, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  itemRow: { color: COLORS.text, fontSize: 13, marginBottom: 4 },
  contactCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  contactName: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  contactAddr: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  notesBox: { backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  notesText: { color: COLORS.orange, fontSize: 12 },
  contactActions: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: COLORS.green + '20', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green + '40' },
  callBtnText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  mapBtn: { flex: 1, backgroundColor: COLORS.blue + '20', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue + '40' },
  mapBtnText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
  earningsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.accent + '40' },
  earningRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  earningLabel: { color: COLORS.muted, fontSize: 13 },
  earningVal: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  commissionNote: { color: COLORS.green, fontSize: 11, marginTop: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
