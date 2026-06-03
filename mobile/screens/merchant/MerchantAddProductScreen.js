import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const CATEGORIES = [
  '🍕 Restauration', '🛒 Épicerie', '💊 Pharmacie',
  '👗 Vêtements', '📱 Électronique', '🏠 Maison', '🌿 Bio & Nature', '❓ Autre',
];

export default function MerchantAddProductScreen({ navigation, route }) {
  const editProduct = route?.params?.product;

  const [name, setName] = useState(editProduct?.name || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [price, setPrice] = useState(editProduct?.price?.toString() || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [stock, setStock] = useState(editProduct?.stock?.toString() || '');
  const [available, setAvailable] = useState(editProduct?.available ?? true);
  const [hasPromo, setHasPromo] = useState(false);
  const [promoPrice, setPromoPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editProduct;
  const canSave = name.trim() && price && parseFloat(price) > 0 && category;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Formulaire incomplet', 'Renseignez le nom, le prix et la catégorie.');
      return;
    }
    setSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : null,
      available,
      promoPrice: hasPromo && promoPrice ? parseFloat(promoPrice) : null,
    };
    try {
      if (isEdit) {
        await api.put(`/api/merchant/products/${editProduct.id}`, payload);
      } else {
        await api.post('/api/merchant/products', payload);
      }
      Alert.alert(
        isEdit ? 'Produit modifié !' : 'Produit ajouté !',
        `"${payload.name}" a été ${isEdit ? 'mis à jour' : 'ajouté à votre catalogue'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Name */}
        <Text style={styles.label}>Nom du produit *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex : Pizza Margherita" placeholderTextColor={COLORS.muted} maxLength={80} />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={description} onChangeText={setDescription}
          placeholder="Décrivez votre produit..."
          placeholderTextColor={COLORS.muted} multiline maxLength={300}
          textAlignVertical="top"
        />

        {/* Price */}
        <Text style={styles.label}>Prix (TND) *</Text>
        <TextInput
          style={styles.input} value={price} onChangeText={setPrice}
          placeholder="0.000" placeholderTextColor={COLORS.muted}
          keyboardType="decimal-pad"
        />

        {/* Promo */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Prix promotionnel</Text>
          <Switch
            value={hasPromo} onValueChange={setHasPromo}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={hasPromo ? COLORS.white : COLORS.muted}
          />
        </View>
        {hasPromo && (
          <TextInput
            style={[styles.input, { borderColor: COLORS.accent }]}
            value={promoPrice} onChangeText={setPromoPrice}
            placeholder="Prix promo (TND)" placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
          />
        )}

        {/* Category */}
        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catBtn, category === c && styles.catBtnActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.catText, category === c && { color: '#000' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stock */}
        <Text style={styles.label}>Stock disponible (optionnel)</Text>
        <TextInput
          style={styles.input} value={stock} onChangeText={setStock}
          placeholder="Laisser vide = illimité"
          placeholderTextColor={COLORS.muted} keyboardType="number-pad"
        />

        {/* Availability */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Disponible à la commande</Text>
            <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>
              {available ? 'Visible dans le catalogue' : 'Masqué des clients'}
            </Text>
          </View>
          <Switch
            value={available} onValueChange={setAvailable}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={available ? COLORS.white : COLORS.muted}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? '💾 Enregistrer les modifications' : '➕ Ajouter le produit'}</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16 },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 14,
  },
  switchLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
