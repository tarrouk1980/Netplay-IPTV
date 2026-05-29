import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  primary: '#F5A623',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#0A0A0F',
};

const PLAN_LABELS = {
  DECOUVERTE: 'Découverte',
  SEMAINE: 'Semaine',
  MENSUEL: 'Mensuel',
  PRO: 'Pro Illimité',
};

const PLAN_COLORS = {
  DECOUVERTE: '#8E8E9A',
  SEMAINE: '#3498DB',
  MENSUEL: '#27AE60',
  PRO: '#F5A623',
};

/**
 * PassStatusCard component
 * Props: subscription, onBuyPass
 */
export default function PassStatusCard({ subscription, onBuyPass }) {
  if (!subscription) {
    return (
      <View style={styles.container}>
        <View style={styles.noPassCard}>
          <Text style={styles.noPassEmoji}>🎫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noPassTitle}>Aucun pass actif</Text>
            <Text style={styles.noPassSubtitle}>Achetez un pass pour commencer</Text>
          </View>
          <TouchableOpacity style={styles.buyBtn} onPress={onBuyPass}>
            <Text style={styles.buyBtnText}>Acheter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { planType, ridesConsumed, ridesTotal, ridesRemaining, expiresAt, status } = subscription;
  const isPro = planType === 'PRO';
  const progressPercent = isPro ? 100 : Math.round((ridesConsumed / ridesTotal) * 100);
  const progressColor = isPro
    ? PLAN_COLORS.PRO
    : progressPercent >= 80
    ? COLORS.error
    : progressPercent >= 60
    ? COLORS.warning
    : COLORS.success;

  const expiryDate = new Date(expiresAt);
  const daysLeft = Math.ceil((expiryDate - new Date()) / 86400000);
  const planColor = PLAN_COLORS[planType] || COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.passCard, { borderLeftColor: planColor, borderLeftWidth: 4 }]}>
        {/* Header row */}
        <View style={styles.passHeader}>
          <View>
            <Text style={styles.planLabel}>Pass {PLAN_LABELS[planType] || planType}</Text>
            <Text style={[styles.statusBadge, status === 'ACTIVE' ? styles.statusActive : styles.statusExpired]}>
              {status === 'ACTIVE' ? '● Actif' : '● Expiré'}
            </Text>
          </View>
          <View style={styles.ridesCounter}>
            {isPro ? (
              <Text style={[styles.ridesNumber, { color: planColor }]}>∞</Text>
            ) : (
              <>
                <Text style={[styles.ridesNumber, { color: progressColor }]}>{ridesRemaining}</Text>
                <Text style={styles.ridesLabel}>/{ridesTotal}</Text>
              </>
            )}
            <Text style={styles.ridesUnit}>courses</Text>
          </View>
        </View>

        {/* Progress bar */}
        {!isPro && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        )}

        {/* Footer */}
        <View style={styles.passFooter}>
          <Text style={styles.expiryText}>
            Expire dans {daysLeft > 0 ? `${daysLeft}j` : 'aujourd\'hui'}
          </Text>
          {!isPro && ridesRemaining <= Math.ceil(ridesTotal * 0.2) && ridesRemaining > 0 && (
            <TouchableOpacity onPress={onBuyPass}>
              <Text style={styles.renewText}>Renouveler →</Text>
            </TouchableOpacity>
          )}
          {ridesRemaining === 0 && (
            <TouchableOpacity onPress={onBuyPass}>
              <Text style={[styles.renewText, { color: COLORS.error }]}>Aucune course restante!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  noPassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    borderStyle: 'dashed',
  },
  noPassEmoji: { fontSize: 28 },
  noPassTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  noPassSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buyBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 13 },
  passCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
  },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  planLabel: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  statusBadge: { fontSize: 12, marginTop: 2 },
  statusActive: { color: COLORS.success },
  statusExpired: { color: COLORS.error },
  ridesCounter: { alignItems: 'flex-end' },
  ridesNumber: { fontSize: 28, fontWeight: '800', lineHeight: 30 },
  ridesLabel: { color: COLORS.textMuted, fontSize: 16, fontWeight: '400' },
  ridesUnit: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2C3A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  passFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expiryText: { color: COLORS.textMuted, fontSize: 12 },
  renewText: { color: COLORS.warning, fontSize: 12, fontWeight: '600' },
});
