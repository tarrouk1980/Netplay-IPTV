import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0A0E1A',
  surface: '#111827',
  card: '#1C2333',
  primary: '#1565C0',
  primaryLight: '#1976D2',
  primaryDark: '#0D47A1',
  accent: '#1E88E5',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#4B5563',
  border: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const INITIAL_STATS = {
  activeUsers: 1248,
  coursesAujourdhui: 342,
  revenusAujourdhui: 4875.5,
  incidentsOuverts: 7,
};

const INITIAL_GRAPHE_7J = [
  { jour: 'Lun', courses: 280, revenus: 3920 },
  { jour: 'Mar', courses: 310, revenus: 4340 },
  { jour: 'Mer', courses: 295, revenus: 4130 },
  { jour: 'Jeu', courses: 330, revenus: 4620 },
  { jour: 'Ven', courses: 390, revenus: 5460 },
  { jour: 'Sam', courses: 420, revenus: 5880 },
  { jour: 'Dim', courses: 342, revenus: 4875 },
];

const MOCK_CHAUFFEURS = [
  { id: '1', nom: 'Ahmed Ben Ali', courses: 28, revenus: 392.0, note: 4.9 },
  { id: '2', nom: 'Sami Trabelsi', courses: 24, revenus: 336.0, note: 4.8 },
  { id: '3', nom: 'Riadh Mansouri', courses: 22, revenus: 308.0, note: 4.7 },
  { id: '4', nom: 'Karim Jebali', courses: 19, revenus: 266.0, note: 4.6 },
  { id: '5', nom: 'Nabil Chahed', courses: 17, revenus: 238.0, note: 4.5 },
];

const MOCK_ALERTES = [
  {
    id: '1',
    type: 'danger',
    icone: '🔴',
    titre: 'Serveur API lent',
    message: 'Latence > 2000ms détectée sur /api/rides',
    heure: 'il y a 5 min',
  },
  {
    id: '2',
    type: 'warning',
    icone: '🟡',
    titre: 'Échec paiement répété',
    message: '12 transactions refusées par la passerelle',
    heure: 'il y a 18 min',
  },
  {
    id: '3',
    type: 'info',
    icone: '🔵',
    titre: 'Tentative de fraude',
    message: 'Compte #4821 signalé pour activité suspecte',
    heure: 'il y a 42 min',
  },
];

const GRAPHE_HEIGHT = 160;

function BarreGraphe({ data, clef, couleur, maxVal }) {
  return (
    <View style={styles.grapheContainer}>
      <View style={styles.grapheBars}>
        {data.map((item, index) => {
          const hauteur = Math.max(4, (item[clef] / maxVal) * GRAPHE_HEIGHT);
          return (
            <View key={index} style={styles.grapheBarWrapper}>
              <Text style={styles.grapheBarValue}>
                {clef === 'revenus' ? `${(item[clef] / 1000).toFixed(1)}k` : item[clef]}
              </Text>
              <View
                style={[
                  styles.grapheBar,
                  { height: hauteur, backgroundColor: couleur },
                ]}
              />
              <Text style={styles.grapheBarLabel}>{item.jour}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AdminStatsOverviewScreen({ navigation }) {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [grapheData, setGrapheData] = useState(INITIAL_GRAPHE_7J);
  const [grapheActif, setGrapheActif] = useState('courses');
  const [dernierRefresh, setDernierRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);

  const simulerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStats({
        activeUsers: INITIAL_STATS.activeUsers + Math.floor(Math.random() * 20 - 10),
        coursesAujourdhui: INITIAL_STATS.coursesAujourdhui + Math.floor(Math.random() * 10),
        revenusAujourdhui: parseFloat(
          (INITIAL_STATS.revenusAujourdhui + Math.random() * 100 - 50).toFixed(2)
        ),
        incidentsOuverts: INITIAL_STATS.incidentsOuverts + Math.floor(Math.random() * 3 - 1),
      });
      setDernierRefresh(new Date());
      setRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      simulerRefresh();
    }, 30000);
    return () => clearInterval(timerRef.current);
  }, []);

  const maxCourses = Math.max(...grapheData.map((d) => d.courses));
  const maxRevenus = Math.max(...grapheData.map((d) => d.revenus));

  const formatHeure = (date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const alerteColors = { danger: COLORS.danger, warning: COLORS.warning, info: COLORS.info };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>Mis à jour : {formatHeure(dernierRefresh)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, refreshing && styles.refreshBtnLoading]}
          onPress={simulerRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshBtnText}>{refreshing ? '⏳' : '🔄'} Actualiser</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.accent }]}>
          <Text style={styles.kpiIcon}>👥</Text>
          <Text style={styles.kpiValue}>{stats.activeUsers.toLocaleString('fr-FR')}</Text>
          <Text style={styles.kpiLabel}>Utilisateurs actifs</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.success }]}>
          <Text style={styles.kpiIcon}>🚗</Text>
          <Text style={styles.kpiValue}>{stats.coursesAujourdhui}</Text>
          <Text style={styles.kpiLabel}>Courses du jour</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.warning }]}>
          <Text style={styles.kpiIcon}>💰</Text>
          <Text style={styles.kpiValue}>{stats.revenusAujourdhui.toFixed(0)} TND</Text>
          <Text style={styles.kpiLabel}>Revenus du jour</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.danger }]}>
          <Text style={styles.kpiIcon}>⚠️</Text>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>{stats.incidentsOuverts}</Text>
          <Text style={styles.kpiLabel}>Incidents ouverts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activité — 7 derniers jours</Text>
          <View style={styles.grapheToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, grapheActif === 'courses' && styles.toggleBtnActive]}
              onPress={() => setGrapheActif('courses')}
            >
              <Text style={[styles.toggleText, grapheActif === 'courses' && styles.toggleTextActive]}>
                Courses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, grapheActif === 'revenus' && styles.toggleBtnActive]}
              onPress={() => setGrapheActif('revenus')}
            >
              <Text style={[styles.toggleText, grapheActif === 'revenus' && styles.toggleTextActive]}>
                Revenus
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <BarreGraphe
          data={grapheData}
          clef={grapheActif}
          couleur={grapheActif === 'courses' ? COLORS.primaryLight : COLORS.success}
          maxVal={grapheActif === 'courses' ? maxCourses : maxRevenus}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 chauffeurs du jour</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 2.5 }]}>Nom</Text>
          <Text style={[styles.tableCell, styles.tableCellCenter]}>Courses</Text>
          <Text style={[styles.tableCell, styles.tableCellCenter]}>Revenus</Text>
          <Text style={[styles.tableCell, styles.tableCellCenter]}>Note</Text>
        </View>
        {MOCK_CHAUFFEURS.map((chauffeur, index) => (
          <View key={chauffeur.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
            <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.tableName} numberOfLines={1}>{chauffeur.nom}</Text>
            </View>
            <Text style={[styles.tableCell, styles.tableCellCenter, { color: COLORS.accent }]}>
              {chauffeur.courses}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { color: COLORS.success }]}>
              {chauffeur.revenus.toFixed(0)} TND
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter]}>
              ⭐ {chauffeur.note}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertes système</Text>
        {MOCK_ALERTES.map((alerte) => (
          <View
            key={alerte.id}
            style={[
              styles.alerteCard,
              { borderLeftColor: alerteColors[alerte.type] },
            ]}
          >
            <View style={styles.alerteHeader}>
              <Text style={styles.alerteIcone}>{alerte.icone}</Text>
              <Text style={[styles.alerteTitre, { color: alerteColors[alerte.type] }]}>
                {alerte.titre}
              </Text>
              <Text style={styles.alerteHeure}>{alerte.heure}</Text>
            </View>
            <Text style={styles.alerteMessage}>{alerte.message}</Text>
          </View>
        ))}
      </View>

      <View style={styles.autoRefreshInfo}>
        <Text style={styles.autoRefreshText}>🔁 Actualisation automatique toutes les 30 secondes</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  refreshBtnLoading: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.7,
  },
  refreshBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  kpiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    width: (width - 32 - 8) / 2,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  grapheToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  grapheContainer: {
    marginTop: 8,
  },
  grapheBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: GRAPHE_HEIGHT + 40,
  },
  grapheBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  grapheBarValue: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  grapheBar: {
    width: '65%',
    borderRadius: 4,
    minHeight: 4,
  },
  grapheBarLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: COLORS.card,
  },
  tableCell: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '700',
  },
  alerteCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alerteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alerteIcone: {
    fontSize: 14,
    marginRight: 8,
  },
  alerteTitre: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  alerteHeure: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  alerteMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingLeft: 22,
  },
  autoRefreshInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  autoRefreshText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
