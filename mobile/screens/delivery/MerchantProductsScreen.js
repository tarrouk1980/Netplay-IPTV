import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  primary: '#F5A623',
  red: '#E74C3C',
  green: '#27AE60',
};

const CATEGORIES = [
  'Alimentation', 'Boissons', 'Hygiène', 'Cosmétiques', 'Électronique',
  'Vêtements', 'Maison', 'Sport', 'Santé', 'Autre',
];

function ProductModal({ visible, product, onSave, onClose }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Autre');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price?.toString() || '');
      setCategory(product.category || 'Autre');
      setDescription(product.description || '');
      setStock(product.stock?.toString() || '');
    } else {
      setName(''); setPrice(''); setCategory('Autre'); setDescription(''); setStock('');
    }
  }, [product, visible]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erreur', 'Le nom du produit est obligatoire.'); return; }
    if (!price.trim() || isNaN(parseFloat(price))) { Alert.alert('Erreur', 'Prix invalide.'); return; }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        stock: stock ? parseInt(stock, 10) : null,
      };
      if (product?.id) {
        await api.patch(`/api/merchants/me/products/${product.id}`, data);
      } else {
        await api.post('/api/merchants/me/products', data);
      }
      onSave();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{product?.id ? 'Modifier le produit' : 'Ajouter un produit'}</Text>

            <Text style={styles.fieldLabel}>Nom du produit *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Eau minérale 1.5L" placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Prix (TND) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Ex: 1.500" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />

            <Text style={styles.fieldLabel}>Catégorie</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Description optionnelle..." placeholderTextColor={COLORS.textMuted} multiline />

            <Text style={styles.fieldLabel}>Stock disponible</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="Laisser vide = illimité" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>{product?.id ? 'Mettre à jour' : 'Ajouter le produit'}</Text>}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function MerchantProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/merchants/me/products');
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      // Fallback vide si route pas encore déployée
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = (product) => {
    Alert.alert(
      'Supprimer ?',
      `Voulez-vous supprimer "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/merchants/me/products/${product.id}`);
              fetchProducts();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer.');
            }
          },
        },
      ]
    );
  };

  const handleOpenAdd = () => { setEditingProduct(null); setModalVisible(true); };
  const handleOpenEdit = (p) => { setEditingProduct(p); setModalVisible(true); };
  const handleSaved = () => { setModalVisible(false); fetchProducts(); };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        {item.description ? <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text> : null}
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{parseFloat(item.price).toFixed(3)} TND</Text>
          {item.stock !== null && item.stock !== undefined && (
            <Text style={[styles.stockBadge, item.stock === 0 && { color: COLORS.red }]}>
              {item.stock === 0 ? 'Rupture' : `Stock: ${item.stock}`}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(item)}>
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes produits</Text>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={handleOpenAdd}>
          <Text style={styles.addHeaderBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>Aucun produit</Text>
          <Text style={styles.emptyText}>Ajoutez vos premiers produits pour que vos clients puissent commander.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
            <Text style={styles.emptyBtnText}>+ Ajouter un produit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ProductModal
        visible={modalVisible}
        product={editingProduct}
        onSave={handleSaved}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { marginRight: 8, padding: 4 },
  backArrow: { fontSize: 32, color: COLORS.primary, lineHeight: 32, marginTop: -4 },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: '700' },
  addHeaderBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addHeaderBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  emptyBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 15 },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfo: { flex: 1 },
  productName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  productCategory: { color: COLORS.primary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  productDesc: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productPrice: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  stockBadge: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  productActions: { flexDirection: 'column', gap: 8, marginLeft: 12 },
  editBtn: { padding: 8, backgroundColor: '#252535', borderRadius: 10 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 8, backgroundColor: '#2A1010', borderRadius: 10 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 20 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  categoryChip: { backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textMuted, fontSize: 12 },
  categoryChipTextActive: { color: COLORS.background, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 16 },
});
