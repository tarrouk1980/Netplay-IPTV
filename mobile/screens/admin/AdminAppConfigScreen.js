import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
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

function ConfigInput({ label, value, onChangeText, keyboardType, unit, hint }) {
  return (
    <View style={ci.wrap}>
      <View style={ci.labelRow}>
        <Text style={ci.label}>{label}</Text>
        {unit ? <Text style={ci.unit}>{unit}</Text> : null}
      </View>
      <TextInput
        style={ci.input}
        value={value?.toString()}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'decimal-pad'}
        placeholderTextColor={COLORS.muted}
      />
      {hint ? <Text style={ci.hint}>{hint}</Text> : null}
    </View>
  );
}

const ci = StyleSheet.create({
  wrap: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: COLORS.muted, fontSize: 13 },
  unit: { color: COLORS.muted, fontSize: 12 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  hint: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
});

function ToggleRow({ label, sublabel, value, onToggle, danger }) {
  return (
    <View style={tr.row}>
      <View style={{ flex: 1 }}>
        <Text style={[tr.label, danger && { color: COLORS.accent }]}>{label}</Text>
        {sublabel ? <Text style={tr.sub}>{sublabel}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: COLORS.border, true: danger ? COLORS.accent : COLORS.green }} thumbColor="#FFF" />
    </View>
  );
}

const tr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  sub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}

export default function AdminAppConfigScreen({ navigation }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/config');
      setConfig(res.data.config);
    } catch {
      setConfig({
        passPrice: { STARTER: 1, PRO: 3, UNLIMITED: 5 },
        taxiBaseFare: 1.5,
        taxiPerKm: 0.8,
        taxiPerMin: 0.1,
        sosBaseFare: 10,
        deliveryBaseFee: 2,
        referralBonus: 5,
        referrerBonus: 2,
        maintenanceMode: false,
        registrationOpen: true,
        newUserBonus: 10,
        taxiEnabled: true,
        deliveryEnabled: true,
        sosEnabled: true,
        groceryEnabled: true,
        maxCancelRate: 20,
        autoSuspendAfterCancels: 5,
        loyaltyPointsPerTaxi: 10,
        loyaltyPointsPerDelivery: 8,
        loyaltyPointsPerSOS: 15,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (key, val) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const updateNested = (parent, key, val) => {
    setConfig((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: val } }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/config', { config });
      Alert.alert('Sauvegardé ✅', 'La configuration a été mise à jour.');
      setDirty(false);
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.blue} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚙️ Configuration de l'app</Text>
        {dirty && (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.green} size="small" /> : <Text style={s.saveBtn}>Sauvegarder</Text>}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.blue} />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Services on/off */}
        <Section title="🚦 Services actifs">
          <ToggleRow label="🚕 Taxi" value={config?.taxiEnabled ?? true} onToggle={(v) => update('taxiEnabled', v)} />
          <View style={s.div} />
          <ToggleRow label="🛵 Livraison" value={config?.deliveryEnabled ?? true} onToggle={(v) => update('deliveryEnabled', v)} />
          <View style={s.div} />
          <ToggleRow label="🛻 SOS/Dépannage" value={config?.sosEnabled ?? true} onToggle={(v) => update('sosEnabled', v)} />
          <View style={s.div} />
          <ToggleRow label="🛒 Épicerie" value={config?.groceryEnabled ?? true} onToggle={(v) => update('groceryEnabled', v)} />
        </Section>

        {/* EasyPass prices */}
        <Section title="👑 EasyPass — Tarifs (TND/jour)">
          <ConfigInput label="STARTER" value={config?.passPrice?.STARTER} onChangeText={(v) => updateNested('passPrice', 'STARTER', parseFloat(v) || 0)} unit="TND" />
          <ConfigInput label="PRO" value={config?.passPrice?.PRO} onChangeText={(v) => updateNested('passPrice', 'PRO', parseFloat(v) || 0)} unit="TND" />
          <ConfigInput label="UNLIMITED" value={config?.passPrice?.UNLIMITED} onChangeText={(v) => updateNested('passPrice', 'UNLIMITED', parseFloat(v) || 0)} unit="TND" />
        </Section>

        {/* Taxi fare */}
        <Section title="🚕 Tarification Taxi">
          <ConfigInput label="Tarif de base" value={config?.taxiBaseFare} onChangeText={(v) => update('taxiBaseFare', parseFloat(v) || 0)} unit="TND" />
          <ConfigInput label="Prix par km" value={config?.taxiPerKm} onChangeText={(v) => update('taxiPerKm', parseFloat(v) || 0)} unit="TND/km" />
          <ConfigInput label="Prix par minute" value={config?.taxiPerMin} onChangeText={(v) => update('taxiPerMin', parseFloat(v) || 0)} unit="TND/min" />
        </Section>

        {/* Delivery fare */}
        <Section title="🛵 Frais de livraison">
          <ConfigInput label="Frais de base" value={config?.deliveryBaseFee} onChangeText={(v) => update('deliveryBaseFee', parseFloat(v) || 0)} unit="TND" />
        </Section>

        {/* SOS fare */}
        <Section title="🛻 Tarification SOS">
          <ConfigInput label="Tarif intervention de base" value={config?.sosBaseFare} onChangeText={(v) => update('sosBaseFare', parseFloat(v) || 0)} unit="TND" />
        </Section>

        {/* Referral */}
        <Section title="🎁 Parrainage">
          <ConfigInput label="Bonus filleul" value={config?.referralBonus} onChangeText={(v) => update('referralBonus', parseFloat(v) || 0)} unit="TND" hint="Crédité au nouveau client" />
          <ConfigInput label="Bonus parrain" value={config?.referrerBonus} onChangeText={(v) => update('referrerBonus', parseFloat(v) || 0)} unit="TND" hint="Crédité au parrain" />
          <ConfigInput label="Bonus inscription" value={config?.newUserBonus} onChangeText={(v) => update('newUserBonus', parseFloat(v) || 0)} unit="TND" />
        </Section>

        {/* Loyalty points */}
        <Section title="⭐ Points EasyPoints">
          <ConfigInput label="Points par course taxi" value={config?.loyaltyPointsPerTaxi} onChangeText={(v) => update('loyaltyPointsPerTaxi', parseInt(v) || 0)} keyboardType="number-pad" unit="pts" />
          <ConfigInput label="Points par livraison" value={config?.loyaltyPointsPerDelivery} onChangeText={(v) => update('loyaltyPointsPerDelivery', parseInt(v) || 0)} keyboardType="number-pad" unit="pts" />
          <ConfigInput label="Points par SOS" value={config?.loyaltyPointsPerSOS} onChangeText={(v) => update('loyaltyPointsPerSOS', parseInt(v) || 0)} keyboardType="number-pad" unit="pts" />
        </Section>

        {/* Anti-fraud */}
        <Section title="🛡 Anti-fraude">
          <ConfigInput label="Taux d'annulation max (%)" value={config?.maxCancelRate} onChangeText={(v) => update('maxCancelRate', parseInt(v) || 0)} keyboardType="number-pad" unit="%" />
          <ConfigInput label="Suspendre après N annulations" value={config?.autoSuspendAfterCancels} onChangeText={(v) => update('autoSuspendAfterCancels', parseInt(v) || 0)} keyboardType="number-pad" />
        </Section>

        {/* System */}
        <Section title="🖥 Système">
          <ToggleRow label="Mode maintenance" sublabel="Désactive l'accès à l'app" value={config?.maintenanceMode ?? false} onToggle={(v) => update('maintenanceMode', v)} danger />
          <View style={s.div} />
          <ToggleRow label="Inscriptions ouvertes" value={config?.registrationOpen ?? true} onToggle={(v) => update('registrationOpen', v)} />
        </Section>

        {dirty && (
          <TouchableOpacity style={s.saveFloating} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.saveFloatingTxt}>💾 Enregistrer les modifications</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  saveBtn: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  div: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  saveFloating: { backgroundColor: COLORS.green, borderRadius: 14, marginHorizontal: 16, marginTop: 20, padding: 16, alignItems: 'center' },
  saveFloatingTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
