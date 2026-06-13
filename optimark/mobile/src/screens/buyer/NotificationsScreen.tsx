import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api";

const TYPE_ICON: Record<string, string> = {
  ORDER: "📦",
  PAYMENT: "💳",
  MESSAGE: "💬",
  PROMO: "🏷️",
  RETURN: "↩️",
  REVIEW: "⭐",
  SYSTEM: "🔔",
};

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data?.data || []);
    setUnread(res.data?.unreadCount || 0);
  };

  useFocusEffect(useCallback(() => {
    load().finally(() => setLoading(false));
  }, []));

  const markAllRead = async () => {
    await api.patch("/notifications/read-all").catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markOne = async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  if (loading) return <ActivityIndicator color="#9f1239" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Notifications</Text>
          {unread > 0 && <Text style={s.subtitle}>{unread} non lue(s)</Text>}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {unread > 0 && (
            <TouchableOpacity style={s.markAllBtn} onPress={markAllRead}>
              <Text style={{ color: "#9f1239", fontWeight: "700", fontSize: 12 }}>Tout lire</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.markAllBtn} onPress={() => navigation.navigate("NotifPreferences")}>
            <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 12 }}>⚙️ Préfs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🔔</Text>
          <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>Aucune notification</Text>
          <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Vous serez notifié(e) ici de vos commandes et messages.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.item, !item.isRead && s.itemUnread]}
              onPress={() => !item.isRead && markOne(item.id)}
              activeOpacity={0.7}
            >
              <View style={s.iconBox}>
                <Text style={{ fontSize: 22 }}>{TYPE_ICON[item.type] || "🔔"}</Text>
              </View>
              <View style={s.body}>
                <Text style={[s.message, !item.isRead && { color: "#0f172a" }]} numberOfLines={3}>
                  {item.message}
                </Text>
                <Text style={s.time}>
                  {new Date(item.createdAt).toLocaleString("fr-TN", { dateStyle: "short", timeStyle: "short" })}
                </Text>
              </View>
              {!item.isRead && <View style={s.dot} />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#f1f5f9" }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 18, paddingTop: 22, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  title: { fontSize: 20, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 12, color: "#9f1239", fontWeight: "600", marginTop: 2 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fef2f2" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  item: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", gap: 12 },
  itemUnread: { backgroundColor: "#fff7f7" },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", flexShrink: 0, borderWidth: 1, borderColor: "#f1f5f9" },
  body: { flex: 1 },
  message: { fontSize: 13, color: "#475569", lineHeight: 18 },
  time: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#9f1239", marginTop: 4, flexShrink: 0 },
});
