import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuthStore();

  const [prenom, setPrenom] = useState((user && user.prenom) || 'Amine');
  const [nom, setNom] = useState((user && user.nom) || 'Trabelsi');
  const [email, setEmail] = useState((user && user.email) || 'amine.trabelsi@email.com');
  const [telephone] = useState((user && user.phone) || '+216 98 765 432');
  const [dateNaissance, setDateNaissance] = useState((user && user.dateNaissance) || '15/04/1990');
  const [ville, setVille] = useState((user && user.ville) || 'Tunis');

  const initials = ((prenom ? prenom[0] : 'A') + (nom ? nom[0] : 'T')).toUpperCase();

  const handleSave = () => {
    Alert.alert('Succès', 'Profil mis à jour avec succès !');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={prenom}
                onChangeText={setPrenom}
                placeholderTextColor={COLORS.muted}
                placeholder="Votre prénom"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholderTextColor={COLORS.muted}
                placeholder="Votre nom"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={COLORS.muted}
                placeholder="Votre adresse e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Téléphone{' '}
                <Text style={styles.disabledNote}>(non modifiable)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={telephone}
                editable={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date de naissance</Text>
              <TextInput
                style={styles.input}
                value={dateNaissance}
                onChangeText={setDateNaissance}
                placeholderTextColor={COLORS.muted}
                placeholder="JJ/MM/AAAA"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                value={ville}
                onChangeText={setVille}
                placeholderTextColor={COLORS.muted}
                placeholder="Votre ville"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
    minWidth: 32,
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  changePhotoText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 6,
  },
  disabledNote: {
    fontSize: 11,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  inputDisabled: {
    color: COLORS.muted,
    backgroundColor: '#141420',
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
