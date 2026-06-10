import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getBotResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('djerba')) return { text: "🏖️ Djerba est parfait ! J'ai trouvé 6 hôtels disponibles. Le meilleur rapport qualité/prix est le **Djerba Beach Resort & Spa** à partir de 285 TND/nuit. Vous préférez all-inclusive ou demi-pension ?", suggestions: ['All-inclusive', 'Demi-pension', 'Voir tous les hôtels'] };
  if (msg.includes('hammamet')) return { text: "🌊 Hammamet, excellente destination ! 5 hôtels disponibles. L'**Hasdrubal Thalassa** est notre coup de cœur avec thalasso incluse. Budget approximatif ?", suggestions: ['Moins de 300 TND', '300-500 TND', 'Pas de limite'] };
  if (msg.includes('marrakech')) return { text: "🕌 Marrakech, ville magique ! 8 hôtels dont le légendaire **La Mamounia**. Quel type de séjour ? Riad authentique ou hôtel moderne ?", suggestions: ['Riad authentique', 'Hôtel moderne', 'Avec piscine'] };
  if (msg.includes('cairo') || msg.includes('caire')) return { text: "🏛️ Le Caire, un voyage inoubliable ! Vue sur les Pyramides depuis le **Marriott Mena House** à partir de 850 EGP/nuit. Durée du séjour ?", suggestions: ['3 jours', '5 jours', '1 semaine'] };

  if (msg.includes('budget') || msg.includes('pas cher') || msg.includes('économique')) {
    const budget = msg.match(/\d+/);
    return { text: `💰 Avec un budget de ${budget ? budget[0] + ' TND' : 'serré'}, je vous recommande des hôtels 3-4 étoiles en Tunisie. Les meilleurs deals sont actuellement à **Sousse** et **Monastir**. Quelle période ?`, suggestions: ['Ce weekend', 'Ce mois', 'Dans 3 mois'] };
  }

  if (msg.includes('famille') || msg.includes('enfant') || msg.includes('kids')) return { text: "👨‍👩‍👧 Pour une famille, je recommande les resorts tout-inclus ! L'**El Mouradi Palm Marina** à Sousse a un super club enfants et 4 piscines. Combien de personnes ?", suggestions: ['2 adultes + 1 enfant', '2 adultes + 2 enfants', 'Grande famille'] };

  if (msg.includes('halal') || msg.includes('sans alcool') || msg.includes('islamique') || msg.includes('muslim')) return { text: "🕌 Très bien ! J'ai filtré les hôtels avec cuisine halal certifiée et sans alcool. **12 hôtels** correspondent à vos critères, dont l'excellent **Steigenberger Al Dau Beach** en Égypte (burkini accepté, piscine séparée). Destination ?", suggestions: ['Tunisie', 'Maroc', 'Égypte'] };

  if (msg.includes('lune de miel') || msg.includes('romantique') || msg.includes('couple') || msg.includes('anniversaire')) return { text: "💒 Félicitations ! Pour une lune de miel parfaite, je recommande le **Four Seasons Sharm El Sheikh** (vue Mer Rouge + suite romantique) ou le **Riad Fès** (architecture andalouse + hammam privé). Quel budget par nuit ?", suggestions: ['500-800 TND', '800-1500 TND', 'Sans limite'] };

  if (msg.includes('ramadan')) return { text: "🌙 Durant le Ramadan, j'ai sélectionné les hôtels avec buffet Iftar, Suhour et ambiance respectueuse. **8 hôtels** en Tunisie et Maroc proposent des packages Ramadan spéciaux avec réductions allant jusqu'à 30% !", suggestions: ['Voir packages Ramadan', 'Tunisie', 'Maroc'] };

  if (msg.includes('médical') || msg.includes('thalasso') || msg.includes('soin') || msg.includes('chirurgie')) return { text: "🏥 La Tunisie est la destination n°1 pour le tourisme médical en Afrique ! L'**Hasdrubal Thalassa Hammamet** offre des soins marins thérapeutiques. Pour la chirurgie esthétique, je peux vous recommander des packages hôtel+clinique.", suggestions: ['Thalassothérapie', 'Chirurgie esthétique', 'Remise en forme'] };

  if (msg.includes('5 étoiles') || msg.includes('luxe') || msg.includes('palace')) return { text: "⭐⭐⭐⭐⭐ Excellente exigence ! Nos hôtels 5★ les plus prisés : **The Palace Hotel Tunis** (9.2/10), **La Mamounia Marrakech** (9.5/10), **Four Seasons Sharm** (9.1/10). Destination préférée ?", suggestions: ['Tunisie', 'Maroc', 'Égypte'] };

  if (msg.includes('voir') || msg.includes('hôtels') || msg.includes('hotels') || msg.includes('résultats')) return { text: "🔍 Je vous redirige vers les résultats de recherche. Voici les meilleures options disponibles !", suggestions: ['Voir les hôtels', 'Affiner ma recherche', 'Nouvelle recherche'] };

  if (msg.includes('all-inclusive') || msg.includes('tout inclus')) return { text: "🍽️ Excellent choix ! L'all-inclusive vous permet de profiter sans compter. J'ai **9 hôtels tout-inclus** à Djerba et Hammamet à partir de 320 TND/nuit par personne. Dates de séjour ?", suggestions: ['Choisir les dates', 'Voir Djerba', 'Voir Hammamet'] };

  if (msg.includes('sousse') || msg.includes('monastir')) return { text: "🌅 Sousse et Monastir, deux perles de la côte tunisienne ! L'**El Mouradi Palm Marina** (Sousse) et le **Iberostar Selection Kantaoui Bay** sont nos coups de cœur. Dès 240 TND/nuit.", suggestions: ['El Mouradi Sousse', 'Kantaoui Bay', 'Comparer les deux'] };

  if (msg.includes('tunisie') || msg.includes('tunis')) return { text: "🇹🇳 La Tunisie offre d'excellentes destinations ! Djerba, Hammamet, Sousse, Monastir... Laquelle vous attire le plus ?", suggestions: ['Djerba', 'Hammamet', 'Sousse'] };

  if (msg.includes('maroc') || msg.includes('morocco')) return { text: "🇲🇦 Le Maroc est magnifique ! Marrakech, Agadir, Fès, Tanger... Chaque ville a son charme unique. Destination préférée ?", suggestions: ['Marrakech', 'Agadir', 'Fès'] };

  if (msg.includes('egypte') || msg.includes('égypte') || msg.includes('sharm') || msg.includes('hurghada')) return { text: "🇪🇬 L'Égypte vous attend ! Sharm El Sheikh pour la plongée et la Mer Rouge, Le Caire pour les Pyramides, Hurghada pour les resorts. Votre choix ?", suggestions: ['Sharm El Sheikh', 'Le Caire', 'Hurghada'] };

  return { text: "Bonjour ! Je suis votre assistant voyage EasyHotels 🌍\n\nJe peux vous aider à trouver :\n• L'hôtel idéal selon votre budget\n• Des hôtels halal certifiés\n• Les meilleures offres flash\n• Des packages famille ou lune de miel\n\nDites-moi votre destination ou budget !", suggestions: ['Meilleurs hôtels Djerba', 'Hôtels halal', 'Budget 300 TND', 'Famille avec enfants'] };
}

function parseText(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'normal', content: text.slice(lastIndex, match.index) });
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'normal', content: text.slice(lastIndex) });
  return parts;
}

function BubbleText({ text, isUser }) {
  const parts = parseText(text);
  return (
    <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
      {parts.map((p, i) =>
        p.type === 'bold'
          ? <Text key={i} style={[styles.bubbleText, isUser && styles.bubbleTextUser, { fontWeight: '800' }]}>{p.content}</Text>
          : <Text key={i}>{p.content}</Text>
      )}
    </Text>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.avatarSmall}>
        <Text style={{ fontSize: 12 }}>🤖</Text>
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

export default function HotelChatbotScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const QUICK_CHIPS = ['Hôtels à Djerba', 'Budget 300 TND', 'Famille avec enfants', 'Sans alcool', 'Lune de miel'];

  useEffect(() => {
    setTimeout(() => {
      const greeting = getBotResponse('');
      setMessages([{ id: '0', from: 'bot', text: greeting.text, suggestions: greeting.suggestions, ts: Date.now() }]);
    }, 400);
  }, []);

  function sendMessage(text) {
    const msg = text.trim();
    if (!msg) return;
    const userMsg = { id: String(Date.now()), from: 'user', text: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(msg);
      const botMsg = { id: String(Date.now() + 1), from: 'bot', text: response.text, suggestions: response.suggestions, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  }

  function onSuggestion(s) {
    sendMessage(s);
  }

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    const showHotelsBtn = !isUser && (item.text.toLowerCase().includes('hôtels') || item.suggestions?.includes('Voir les hôtels'));
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <BubbleText text={item.text} isUser={isUser} />
          {showHotelsBtn && (
            <TouchableOpacity style={styles.hotelsBtnInBubble} onPress={() => navigation.navigate('HotelResults', { destination: '' })}>
              <Text style={styles.hotelsBtnText}>🏨 Voir les hôtels</Text>
            </TouchableOpacity>
          )}
          {!isUser && item.suggestions && item.suggestions.length > 0 && (
            <View style={styles.suggestionChips}>
              {item.suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggChip} onPress={() => onSuggestion(s)}>
                  <Text style={styles.suggChipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F0F4F8' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#004E89', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.botAvatarLarge}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistant EasyHotels</Text>
            <Text style={styles.headerSub}>En ligne · Répond instantanément</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Quick chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsRow} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
        {QUICK_CHIPS.map((c, i) => (
          <TouchableOpacity key={i} style={styles.quickChip} onPress={() => onSuggestion(c)}>
            <Text style={styles.quickChipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Posez votre question..."
          placeholderTextColor="#A0AEC0"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={() => sendMessage(input)} disabled={!input.trim()}>
          <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.sendBtnGrad}>
            <Ionicons name="send" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  botAvatarLarge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },
  chatContent: { padding: 12, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#004E89' },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12 },
  bubbleBot: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  bubbleUser: { backgroundColor: '#FF6B35', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: '#2D3748', lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  suggestionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  suggChip: { backgroundColor: '#EBF4FF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#BEE3F8' },
  suggChipText: { fontSize: 12, color: '#004E89', fontWeight: '600' },
  hotelsBtnInBubble: { marginTop: 10, backgroundColor: '#FF6B35', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
  hotelsBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  typingContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A0AEC0' },
  quickChipsRow: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  quickChip: { backgroundColor: '#FFF5F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#FDBA74' },
  quickChipText: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  textInput: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#2D3748', borderWidth: 1.5, borderColor: '#E2E8F0', maxHeight: 80 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
