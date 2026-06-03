import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const CATEGORIES = [
  { key: 'all', label: '🌐 Tout' },
  { key: 'taxi', label: '🚕 Taxi' },
  { key: 'sos', label: '🛻 SOS' },
  { key: 'delivery', label: '📦 Livraison' },
  { key: 'grocery', label: '🛒 Courses' },
  { key: 'tips', label: '💡 Astuces' },
];

const MOCK_POSTS = [
  {
    id: '1', category: 'taxi', author: 'Ahmed B.', avatar: '🧔', time: 'il y a 12 min',
    title: 'Chauffeur très professionnel sur Lac Tunis !',
    body: 'J\'ai pris EasyTaxy ce matin, le chauffeur Karim était ponctuel et le véhicule impeccable. Je recommande 100% 👍',
    likes: 24, comments: 5, verified: true,
  },
  {
    id: '2', category: 'sos', author: 'Fatma K.', avatar: '👩', time: 'il y a 1h',
    title: 'SOS dépannage rapide à Ariana',
    body: 'Pneu crevé sur l\'autoroute, le dépanneur est arrivé en moins de 20 minutes. Merci EasyWay !',
    likes: 41, comments: 8, verified: false,
  },
  {
    id: '3', category: 'tips', author: 'Mohamed T.', avatar: '🧑', time: 'il y a 3h',
    title: 'Astuce : code promo FLASH30 sur EasyTaxy',
    body: 'Le code FLASH30 donne 30% de réduction sur votre prochaine course. Valable jusqu\'à ce soir !',
    likes: 88, comments: 14, verified: true,
  },
  {
    id: '4', category: 'grocery', author: 'Sonia M.', avatar: '👩‍🦱', time: 'hier',
    title: 'Livraison courses Carrefour en 45 min',
    body: 'Commande passée à 10h, livrée à 10h45 avec tous les articles. Emballage soigné. Super service !',
    likes: 19, comments: 3, verified: false,
  },
  {
    id: '5', category: 'delivery', author: 'Yassine A.', avatar: '🧑‍💼', time: 'hier',
    title: 'EasyPackage fiable pour envoi inter-villes',
    body: 'Envoyé un colis de Tunis à Sfax, arrivé le lendemain matin. Tracking en temps réel, parfait.',
    likes: 32, comments: 6, verified: true,
  },
];

function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLocalLikes((v) => v + (liked ? -1 : 1));
    onLike?.(post.id);
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={{ fontSize: 28 }}>{post.avatar}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            {post.verified && <Text style={{ color: COLORS.accent, fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: COLORS.accent + '22' }]}>
          <Text style={{ color: COLORS.accent, fontSize: 10, fontWeight: '700' }}>
            {CATEGORIES.find((c) => c.key === post.category)?.label || post.category}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postBody}>{post.body}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Text style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionCount, liked && { color: COLORS.red }]}>{localLikes}</Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Text style={{ fontSize: 16 }}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={{ fontSize: 16 }}>↗️</Text>
          <Text style={styles.actionCount}>Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EasyCommunityScreen({ navigation }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [category, setCategory] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/community/posts');
        if (res.data?.posts?.length) setPosts(res.data.posts);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = category === 'all' ? posts : posts.filter((p) => p.category === category);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await api.post('/api/community/posts', { body: newPost, category: 'tips' });
    } catch {}
    const optimistic = {
      id: Date.now().toString(), category: 'tips',
      author: user?.name || 'Moi', avatar: '😊', time: 'À l\'instant',
      title: newPost.slice(0, 60), body: newPost, likes: 0, comments: 0, verified: false,
    };
    setPosts((p) => [optimistic, ...p]);
    setNewPost('');
    setPosting(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👥 Communauté</Text>
        <Text style={styles.headerCount}>{posts.length} posts</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catList}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.catBtn, category === c.key && styles.catBtnActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text style={[styles.catText, category === c.key && { color: '#000' }]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.composeBox}>
        <TextInput
          style={styles.composeInput}
          placeholder="Partagez votre expérience..."
          placeholderTextColor={COLORS.muted}
          value={newPost}
          onChangeText={setNewPost}
          multiline
          maxLength={280}
        />
        <TouchableOpacity
          style={[styles.postBtn, (!newPost.trim() || posting) && { opacity: 0.5 }]}
          onPress={handlePost}
          disabled={!newPost.trim() || posting}
        >
          {posting ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Publier</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 30 }} />}
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {filtered.length === 0 && !loading && (
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>
            Aucun post dans cette catégorie.
          </Text>
        )}
        <View style={{ height: 24 }} />
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerCount: { color: COLORS.muted, fontSize: 13 },
  catScroll: { maxHeight: 48 },
  catList: { paddingHorizontal: 12, gap: 8, paddingVertical: 8 },
  catBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  composeBox: {
    flexDirection: 'row', alignItems: 'flex-end',
    margin: 12, gap: 8,
  },
  composeInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, maxHeight: 80,
  },
  postBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  postBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  list: { paddingHorizontal: 12, gap: 12 },
  postCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAuthor: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  postTime: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  postTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14, marginBottom: 6 },
  postBody: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { color: COLORS.muted, fontSize: 13 },
});
