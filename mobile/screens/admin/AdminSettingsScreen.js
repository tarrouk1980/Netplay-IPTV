import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',
};

export default function AdminSettingsScreen({ navigation }) {
  const [fraisPlateforme, setFraisPlateforme] = useState('8');
  const [fraisLivraison, setFraisLivraison] = useState('3.500');
  const [prixMinTaxi, setPrixMinTaxi] = useState('5.000');

  const [notifSMS, setNotifSMS] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMSDriver, setNotifSMSDriver] = useState(true);
  const [notifEmailDriver, setNotifEmailDriver] = useState(false);
  const [notifPushDriver, setNotifPushDriver] = useState(true);
  const [notifSMSAdmin, setNotifSMSAdmin] = useState(false);
  const [notifEmailAdmin, setNotifEmailAdmin] = useState(true);
  const [notifPushAdmin, setNotifPushAdmin] = useState(true);

  const [modeMaintenance, setModeMaintenance] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [dureeSession, setDureeSession] = useState('60');
  const [tentativesMax, setTentativesMax] = useState('5');

  const handleViderCache = () => {
    Alert.alert(
      "Vider le cache",
      "Êtes-vous sûr de vouloir vider le cache système ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", style: "destructive", onPress: () => Alert.alert("Cache vidé", "Le cache a été vidé avec succès.") },
      ]
    );
  };

  const handleExporter = () => {
    Alert.alert("Export lancé", "Les données sont en cours d'exportation. Vous recevrez un email.");
  };

  const handleSave = () => {
    Alert.alert("Succès", "Paramètres sauvegardés avec succès");
  };

  const SectionTitle = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const RowInput = ({ label, value, onChangeText, keyboardType, suffix }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'decimal-pad'}
          placeholderTextColor={COLORS.muted}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );

  const RowSwitch = ({ label, value, onValueChange, warning }) => (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, warning && value ? { color: COLORS.error } : null]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: warning ? COLORS.error : COLORS.primary }}
        thumbColor={COLORS.text}
      />
    </View>
  );

  const NotifRow = ({ role, sms, setSms, email, setEmail, push, setPush }) => (
    <View style={styles.notifBlock}>
      <Text style={styles.notifRole}>{role}</Text>
      <View style={styles.notifToggles}>
        <View style={styles.notifToggleItem}>
          <Text style={styles.notifToggleLabel}>SMS</Text>
          <Switch
            value={sms}
            onValueChange={setSms}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.text}
          />
        </View>
        <View style={styles.notifToggleItem}>
          <Text style={styles.notifToggleLabel}>Email</Text>
          <Switch
            value={email}
            onValueChange={setEmail}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.text}
          />
        </View>
        <View style={styles.notifToggleItem}>
          <Text style={styles.notifToggleLabel}>Push</Text>
          <Switch
            value={push}
            onValueChange={setPush}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>
    </View>
  );

  const StatusDot = ({ active, label }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.statusDotRow}>
        <View style={[styles.dot, { backgroundColor: active ? COLORS.success : COLORS.error }]} />
        <Text style={[styles.statusText, { color: active ? COLORS.success : COLORS.error }]}>
          {active ? "Connecté" : "Déconnecté"}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres système</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Tarification */}
        <SectionTitle title="💰 Tarification" />
        <View style={styles.card}>
          <RowInput
            label="Frais plateforme"
            value={fraisPlateforme}
            onChangeText={setFraisPlateforme}
            suffix="%"
          />
          <View style={styles.divider} />
          <RowInput
            label="Frais livraison de base"
            value={fraisLivraison}
            onChangeText={setFraisLivraison}
            suffix="TND"
          />
          <View style={styles.divider} />
          <RowInput
            label="Prix minimum taxi"
            value={prixMinTaxi}
            onChangeText={setPrixMinTaxi}
            suffix="TND"
          />
        </View>

        {/* Notifications */}
        <SectionTitle title="🔔 Notifications" />
        <View style={styles.card}>
          <NotifRow
            role="Clients"
            sms={notifSMS} setSms={setNotifSMS}
            email={notifEmail} setEmail={setNotifEmail}
            push={notifPush} setPush={setNotifPush}
          />
          <View style={styles.divider} />
          <NotifRow
            role="Chauffeurs / Livreurs"
            sms={notifSMSDriver} setSms={setNotifSMSDriver}
            email={notifEmailDriver} setEmail={setNotifEmailDriver}
            push={notifPushDriver} setPush={setNotifPushDriver}
          />
          <View style={styles.divider} />
          <NotifRow
            role="Administrateurs"
            sms={notifSMSAdmin} setSms={setNotifSMSAdmin}
            email={notifEmailAdmin} setEmail={setNotifEmailAdmin}
            push={notifPushAdmin} setPush={setNotifPushAdmin}
          />
        </View>

        {/* Maintenance */}
        <SectionTitle title="🔧 Maintenance" />
        <View style={styles.card}>
          <RowSwitch
            label={modeMaintenance ? "⚠️  Mode maintenance ACTIF" : "Mode maintenance"}
            value={modeMaintenance}
            onValueChange={setModeMaintenance}
            warning={true}
          />
          {modeMaintenance && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️  L'application est inaccessible aux utilisateurs</Text>
            </View>
          )}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleViderCache}>
            <Text style={styles.actionLabel}>Vider le cache système</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleExporter}>
            <Text style={styles.actionLabel}>Exporter les données</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sécurité */}
        <SectionTitle title="🔒 Sécurité" />
        <View style={styles.card}>
          <RowSwitch
            label="2FA obligatoire"
            value={twoFA}
            onValueChange={setTwoFA}
          />
          <View style={styles.divider} />
          <RowInput
            label="Durée de session"
            value={dureeSession}
            onChangeText={setDureeSession}
            keyboardType="number-pad"
            suffix="min"
          />
          <View style={styles.divider} />
          <RowInput
            label="Tentatives max connexion"
            value={tentativesMax}
            onChangeText={setTentativesMax}
            keyboardType="number-pad"
          />
        </View>

        {/* Intégrations */}
        <SectionTitle title="🔌 Intégrations" />
        <View style={styles.card}>
          <StatusDot active={true} label="API Paiement (Konnect)" />
          <View style={styles.divider} />
          <StatusDot active={true} label="SMS Gateway" />
          <View style={styles.divider} />
          <StatusDot active={false} label="Maps API" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Sauvegarder les paramètres</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
  },
  input: {
    color: COLORS.text,
    fontSize: 14,
    width: 70,
    paddingVertical: 6,
    textAlign: 'right',
  },
  inputSuffix: {
    color: COLORS.muted,
    fontSize: 13,
    marginLeft: 4,
  },
  warningBanner: {
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderTopWidth: 1,
    borderTopColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  warningText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionLabel: {
    color: COLORS.text,
    fontSize: 14,
  },
  actionArrow: {
    color: COLORS.muted,
    fontSize: 18,
  },
  notifBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notifRole: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  notifToggles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  notifToggleItem: {
    alignItems: 'center',
    gap: 6,
  },
  notifToggleLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
