import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import useAdminStore from '../../store/adminStore';

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
};

const ROLE_COLORS = {
  CLIENT: '#1565C0',
  CHAUFFEUR: '#2E7D32',
  LIVREUR: '#F57C00',
  DEPANNEUR: '#6A1B9A',
  MARCHAND: '#00838F',
  ADMIN: '#D32F2F',
};

// ── Reject Modal ─────────────────────────────────────────────────────────────
function RejectModal({ visible, user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      Alert.alert('Requis', 'Veuillez saisir une raison de rejet.');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(user.id, reason.trim());
      setReason('');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={rModal.overlay}>
        <View style={rModal.card}>
          <Text style={rModal.title}>❌ Rejeter le KYC</Text>
          <Text style={rModal.sub}>
            {user?.name} — {user?.role}
          </Text>
          <TextInput
            style={rModal.input}
            placeholder="Raison du rejet (visible par l'utilisateur)..."
            placeholderTextColor={COLORS.muted}
            value={reason}
            onChangeText={setReason}
            multiline
            autoFocus
          />
          <View style={rModal.row}>
            <TouchableOpacity style={rModal.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={rModal.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rModal.confirmBtn} onPress={handleConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={rModal.confirmTxt}>Rejeter</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const rModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelTxt: { color: COLORS.muted, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  confirmTxt: { color: COLORS.white, fontWeight: '700' },
});

// ── KYC Item ─────────────────────────────────────────────────────────────────
function KYCItem({ user, onApprove, onReject, onViewDetail }) {
  const roleColor = ROLE_COLORS[user.role] || COLORS.muted;
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(user.id);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setApproving(false);
    }
  };

  // Parse kycDocuments
  let kycDocs = {};
  try {
    kycDocs = user.kycDocuments ? JSON.parse(user.kycDocuments) : {};
  } catch (_) {}

  const API_BASE = '';  // Adjust if backend base URL is needed

  return (
    <View style={kItem.card}>
      <View style={kItem.top}>
        <View style={kItem.info}>
          <Text style={kItem.name}>{user.name}</Text>
          <Text style={kItem.phone}>{user.phone}</Text>
          {user.email ? <Text style={kItem.email}>{user.email}</Text> : null}
          <Text style={[kItem.phone, { marginTop: 2 }]}>Rôle: {user.role}</Text>
        </View>
        <View style={[kItem.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
          <Text style={[kItem.roleText, { color: roleColor }]}>{user.role}</Text>
        </View>
      </View>
      <Text style={kItem.date}>
        Soumis le {new Date(user.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </Text>

      {/* KYC Photos */}
      {(kycDocs.facePhoto || kycDocs.truckPhoto) && (
        <View style={kItem.photosRow}>
          {kycDocs.facePhoto && (
            <View style={kItem.photoWrapper}>
              <Text style={kItem.photoLabel}>Photo identité</Text>
              <Image
                source={{ uri: `${API_BASE}/uploads/kyc/${user.id}/` + kycDocs.facePhoto.split('/').pop() }}
                style={kItem.photo}
                resizeMode="cover"
              />
            </View>
          )}
          {kycDocs.truckPhoto && (
            <View style={kItem.photoWrapper}>
              <Text style={kItem.photoLabel}>Photo camion</Text>
              <Image
                source={{ uri: `${API_BASE}/uploads/kyc/${user.id}/` + kycDocs.truckPhoto.split('/').pop() }}
                style={kItem.photo}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      )}

      <View style={kItem.actions}>
        <TouchableOpacity style={kItem.approveBtn} onPress={handleApprove} disabled={approving}>
          {approving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={kItem.approveTxt}>✅ Approuver</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={kItem.rejectBtn} onPress={() => onReject(user)}>
          <Text style={kItem.rejectTxt}>❌ Rejeter</Text>
        </TouchableOpacity>
        {onViewDetail && (
          <TouchableOpacity style={[kItem.rejectBtn, { borderColor: '#1565C0', backgroundColor: '#1565C022' }]} onPress={onViewDetail}>
            <Text style={[kItem.rejectTxt, { color: '#4A9EFF' }]}>🔍 Détail</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const kItem = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  info: { flex: 1, gap: 2 },
  name: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  phone: { color: COLORS.muted, fontSize: 13 },
  email: { color: COLORS.muted, fontSize: 12 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: '700' },
  date: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  photosRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  photoWrapper: { flex: 1, alignItems: 'center' },
  photoLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  photo: { width: '100%', height: 100, borderRadius: 8, backgroundColor: COLORS.surfaceAlt },
  actions: { flexDirection: 'row', gap: 10 },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  approveTxt: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  rejectBtn: {
    flex: 1,
    backgroundColor: COLORS.accent + '22',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  rejectTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AdminKYCScreen({ navigation }) {
  const { pendingKYC, pendingKYCCount, isLoading, fetchPendingKYC, approveKYC, rejectKYC } =
    useAdminStore();

  const [rejectModalUser, setRejectModalUser] = useState(null);

  const load = useCallback(() => {
    fetchPendingKYC();
  }, [fetchPendingKYC]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    await approveKYC(id);
    Alert.alert('KYC approuvé ✅', 'L\'utilisateur a été notifié.');
  };

  const handleRejectConfirm = async (id, reason) => {
    await rejectKYC(id, reason);
    Alert.alert('KYC rejeté', 'L\'utilisateur a été notifié.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🔖 KYC en attente</Text>
          <Text style={styles.headerSub}>{pendingKYCCount} dossiers</Text>
        </View>
        {pendingKYCCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{pendingKYCCount}</Text>
          </View>
        ) : null}
      </View>

      {pendingKYC.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Tout est à jour !</Text>
          <Text style={styles.emptySub}>Aucun dossier KYC en attente.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingKYC}
          keyExtractor={(u) => u.id}
          renderItem={({ item: user }) => (
            <KYCItem
              user={user}
              onApprove={handleApprove}
              onReject={(u) => setRejectModalUser(u)}
              onViewDetail={() => navigation.navigate('AdminKYCDetail', { userId: user.id, userName: user.name })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.accent} />
          }
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        />
      )}

      <RejectModal
        visible={!!rejectModalUser}
        user={rejectModalUser}
        onClose={() => setRejectModalUser(null)}
        onConfirm={handleRejectConfirm}
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
    gap: 14,
  },
  backBtn: { padding: 4 },
  backTxt: { color: COLORS.white, fontSize: 22 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  emptySub: { color: COLORS.muted, fontSize: 14 },
});
