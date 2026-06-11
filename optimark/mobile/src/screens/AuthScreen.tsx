import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const submit = async () => {
    if (!email || !password) { Alert.alert("Champs requis", "Email et mot de passe requis."); return; }
    if (mode === "register" && !name) { Alert.alert("Champs requis", "Le nom est requis."); return; }
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Authentification échouée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.logo}>
          <Text style={s.logoText}>OPTIMARK</Text>
        </View>

        <View style={s.card}>
          {/* Toggle */}
          <View style={s.toggle}>
            <TouchableOpacity style={[s.toggleBtn, mode === "login" && s.toggleActive]} onPress={() => setMode("login")}>
              <Text style={[s.toggleText, mode === "login" && s.toggleTextActive]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.toggleBtn, mode === "register" && s.toggleActive]} onPress={() => setMode("register")}>
              <Text style={[s.toggleText, mode === "register" && s.toggleTextActive]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {mode === "register" && (
            <TextInput style={s.input} placeholder="Nom complet" value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
            <Text style={s.btnText}>{loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#f8fafc", justifyContent: "center", padding: 24 },
  logo: { alignItems: "center", marginBottom: 32 },
  logoText: { fontSize: 32, fontWeight: "900", color: "#9f1239", letterSpacing: 3 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, gap: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  toggle: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 8 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  toggleActive: { backgroundColor: "#9f1239" },
  toggleText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  toggleTextActive: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#1e293b" },
  btn: { backgroundColor: "#9f1239", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
