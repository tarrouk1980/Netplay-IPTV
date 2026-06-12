import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, ScrollView, Image
} from "react-native";
import api from "../../api";
import { useCart } from "../../contexts/CartContext";

export default function LiveViewScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { addItem } = useCart();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<{ id: string; text: string; user: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.get(`/live/${id}`)
      .then(r => setSession(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const fakeMessages = [
      { id: "1", text: "Super produit ! 🔥", user: "Sara" },
      { id: "2", text: "C'est disponible en rouge ?", user: "Ahmed" },
      { id: "3", text: "Je commande tout de suite 😍", user: "Mariem" },
    ];
    setMessages(fakeMessages);
  }, [id]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    const newMsg = { id: Date.now().toString(), text: msg.trim(), user: "Vous" };
    setMessages(prev => [...prev, newMsg]);
    setMsg("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addToCart = (product: any) => {
    addItem({ id: product.id, title: product.title, price: product.price, seller: session?.vendor?.name || "Vendeur", qty: 1 });
    navigation.navigate("Cart");
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;
  if (!session) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#64748b" }}>Live introuvable.</Text>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Live header */}
      <View style={s.header}>
        <View style={s.livePill}>
          <View style={s.redDot} />
          <Text style={s.liveText}>EN DIRECT</Text>
        </View>
        <Text style={s.sessionTitle} numberOfLines={1}>{session.title}</Text>
        <View style={s.viewers}>
          <Text style={{ fontSize: 14 }}>👁</Text>
          <Text style={s.viewerCount}>{session.viewerCount || 0}</Text>
        </View>
      </View>

      {/* Video placeholder */}
      <View style={s.videoArea}>
        <Text style={{ fontSize: 64 }}>📺</Text>
        <Text style={{ color: "#94a3b8", marginTop: 8, fontWeight: "600" }}>
          {session.vendor?.name || "Vendeur"} est en direct
        </Text>
      </View>

      {/* Featured products */}
      {session.products?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={s.productsStrip} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
          {session.products.map((p: any) => (
            <TouchableOpacity key={p.id} style={s.productCard} onPress={() => addToCart(p)}>
              <View style={s.productImgBox}>
                {p.images?.[0]
                  ? <Image source={{ uri: p.images[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  : <Text style={{ fontSize: 24 }}>📦</Text>}
              </View>
              <Text style={s.productName} numberOfLines={2}>{p.title}</Text>
              <Text style={s.productPrice}>{Number(p.price).toFixed(2)} TND</Text>
              <View style={s.cartBtn}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>Acheter</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Chat */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        style={s.chatList}
        contentContainerStyle={{ padding: 12, gap: 6 }}
        renderItem={({ item }) => (
          <View style={s.chatMsg}>
            <Text style={s.chatUser}>{item.user}: </Text>
            <Text style={s.chatText}>{item.text}</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={msg}
          onChangeText={setMsg}
          placeholder="Écrire un message..."
          placeholderTextColor="#94a3b8"
          returnKeyType="send"
          onSubmitEditing={sendMsg}
        />
        <TouchableOpacity style={s.sendBtn} onPress={sendMsg}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10, backgroundColor: "#1e293b" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  sessionTitle: { flex: 1, color: "#fff", fontWeight: "700", fontSize: 13 },
  viewers: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewerCount: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  videoArea: { height: 200, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: "#334155" },
  productsStrip: { maxHeight: 160, backgroundColor: "#1e293b", borderTopWidth: 1, borderTopColor: "#334155" },
  productCard: { width: 100, backgroundColor: "#0f172a", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#334155", padding: 8 },
  productImgBox: { height: 60, backgroundColor: "#1e293b", borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  productName: { color: "#e2e8f0", fontSize: 10, fontWeight: "600", marginBottom: 3 },
  productPrice: { color: "#9f1239", fontSize: 12, fontWeight: "900", marginBottom: 5 },
  cartBtn: { backgroundColor: "#9f1239", borderRadius: 6, paddingVertical: 5, alignItems: "center" },
  chatList: { flex: 1, backgroundColor: "transparent" },
  chatMsg: { flexDirection: "row", flexWrap: "wrap" },
  chatUser: { color: "#9f1239", fontSize: 12, fontWeight: "800" },
  chatText: { color: "#cbd5e1", fontSize: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, backgroundColor: "#1e293b", borderTopWidth: 1, borderTopColor: "#334155" },
  input: { flex: 1, backgroundColor: "#334155", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: "#e2e8f0" },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#9f1239", alignItems: "center", justifyContent: "center" },
});
