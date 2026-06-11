# ✈ EasyFlight

> Comparateur de vols et ferries Espagne ↔ Maghreb — App mobile + Backend + Landing page

---

## Structure

```
easyflight/
├── mobile/              React Native (Expo) — iOS & Android
├── backend/             Node.js API (Express) — port 4000
├── web/                 Landing page marketing (HTML/CSS, espagnol)
└── store-listing/       Textes App Store / Google Play (ES + FR)
```

---

## Lancer en local

### Backend
```bash
cd backend
npm install
cp .env.example .env    # puis remplir TRAVELPAYOUTS_TOKEN
npm run dev             # → http://localhost:4000
```

### App mobile
```bash
cd mobile
npm install
npx expo start          # scanner le QR avec Expo Go
```

---

## Configuration — 4 étapes pour gagner de l'argent

### 1. Travelpayouts (vols)
1. Créer un compte sur **travelpayouts.com** (gratuit)
2. Récupérer ton **Token API** + ton **Marker ID**
3. Dans `backend/.env` : `TRAVELPAYOUTS_TOKEN=xxx` et `TRAVELPAYOUTS_MARKER=xxx`
4. Les boutons "Réserver →" redirigent vers Ryanair/Vueling avec tracking affilié

### 2. Directferries (ferries)
1. S'inscrire sur **directferries.com/affiliate-program**
2. Remplacer les URLs dans `backend/src/services/ferrySearch.js`

### 3. AdMob (publicités in-app)
1. Créer app sur **admob.google.com**
2. Remplacer `ca-app-pub-XXXX` dans `mobile/app.json` et `mobile/src/components/AdBanner.js`

### 4. Booking.com Hotels (optionnel)
1. S'inscrire sur **partners.booking.com**
2. Ajouter des liens hôtels après réservation vol

---

## Build & publication

### Android (APK pour test)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### iOS + Android (production)
```bash
eas build --platform all --profile production
eas submit --platform all
```

---

## Revenus estimés (marché espagnol)

| Source | Modèle | Estimation mois 1 |
|---|---|---|
| Travelpayouts (vols) | CPC 0.10–0.50€ / clic | 500–2000€ |
| Directferries | CPA 2–5€ / résa | 200–800€ |
| AdMob | CPM 1–3€ / 1000 vues | 100–500€ |
| **Total** | | **~800–3300€ / mois** |

*Projection basée sur 5 000 utilisateurs actifs / mois*

---

## Routes couvertes

**Vols** : Madrid, Barcelone, Valence, Málaga, Séville → Casablanca, Marrakech, Tanger, Fès, Alger, Oran, Tunis, Djerba, Nador…

**Ferries** : Algésiras, Tarifa, Almería, Barcelone, Valence → Tanger, Nador, Oran, Alger, Tunis…

---

## Technologies

- **Mobile** : React Native 0.73 + Expo 50 + React Navigation 6
- **Backend** : Node.js + Express + rate-limit
- **Affiliation** : Travelpayouts API v1/v2 avec fallback mock
- **Ads** : react-native-google-mobile-ads (AdMob)
- **Push** : expo-notifications
