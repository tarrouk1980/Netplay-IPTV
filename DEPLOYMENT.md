# 🚀 Guide de Déploiement EasyHotels Maghreb

## Étape 1 — Créer un compte Render.com (5 minutes)
1. Aller sur https://render.com → Sign Up (gratuit)
2. Connecter votre compte GitHub
3. New → Blueprint → Sélectionner ce repo
4. Render va lire le render.yaml et créer automatiquement :
   - ✅ Base de données PostgreSQL (gratuit)
   - ✅ Redis Cache (gratuit)
   - ✅ Serveur Node.js API (gratuit)
5. Votre URL backend sera : https://easyway-api.onrender.com

## Étape 2 — Configurer les variables d'environnement (2 minutes)
Dans Render Dashboard → easyway-api → Environment :
- FIREBASE_PROJECT_ID : (votre projet Firebase)
- MAPBOX_TOKEN : (optionnel, pour les cartes)

## Étape 3 — Déployer l'app mobile (30 minutes)

### 3a. Installer Expo EAS CLI
```bash
npm install -g eas-cli
cd mobile
eas login
```

### 3b. Configurer le backend URL
Créer le fichier mobile/.env :
```
EXPO_PUBLIC_API_URL=https://easyway-api.onrender.com
```

### 3c. Builder l'app Android (APK pour test)
```bash
cd mobile
eas build --platform android --profile preview
```
→ Téléchargez l'APK et testez sur votre téléphone

### 3d. Builder pour les stores (production)
```bash
eas build --platform all --profile production
```

## Étape 4 — Soumettre sur Google Play (1-3 jours)
1. Créer compte Google Play Console : https://play.google.com/console
   - Frais unique : 25 USD
2. Créer une nouvelle app "EasyHotels - Comparer les Prix"
3. `eas submit --platform android`

## Étape 5 — Soumettre sur App Store (1-7 jours)
1. Compte Apple Developer : https://developer.apple.com
   - Abonnement annuel : 99 USD
2. `eas submit --platform ios`

## Étape 6 — S'inscrire aux programmes d'affiliation

### Booking.com Affiliate
1. https://affiliate.booking.com → Register
2. Remplir le formulaire (site web/app mobile)
3. Délai approbation : 24-48h
4. Votre AID (Affiliate ID) → mettre dans EXPO_PUBLIC_BOOKING_AFFILIATE_ID

### Expedia Affiliate
1. https://expediagroup.com/solutions/advertising
2. Programme "Travel Ads" pour mobile apps
3. Délai : 3-5 jours ouvrables

### Hotels.com
1. https://fr.hotels.com/affiliates
2. Via Commission Junction (CJ Affiliate)

### Airbnb Associates
1. https://www.airbnb.fr/associates/joining
2. Commission : 4-8% par réservation

## Étape 7 — Démarcher les hôtels tunisiens

### Script de prospection (email à envoyer)
```
Objet: Augmentez vos réservations directes avec EasyHotels

Bonjour,

Je vous contacte au sujet d'EasyHotels, le premier comparateur de prix 
hôtels dédié au Maghreb (Tunisie, Maroc, Algérie).

Avec EasyHotels, votre hôtel apparaît devant des milliers de voyageurs 
qui cherchent activement à réserver en Tunisie.

Notre offre :
✅ Pack Starter : 50 TND/mois → Top 5 dans les résultats
✅ Pack Pro : 150 TND/mois → Top 3 + badge "Recommandé"  
✅ Pack Premium : 400 TND/mois → Position #1 + "Meilleur Prix Garanti"

Intéressé ? Répondez à cet email ou appelez le [VOTRE NUMÉRO].

Cordialement
```

## Estimation des Revenus

| Mois | Hôtels partenaires | Clics/jour | Revenus CPC | Abonnements | Total |
|------|--------------------|-----------|-------------|-------------|-------|
| 1    | 5                  | 50        | 1 200 TND   | 250 TND     | 1 450 TND |
| 3    | 20                 | 200       | 4 800 TND   | 1 500 TND   | 6 300 TND |
| 6    | 50                 | 600       | 14 400 TND  | 5 000 TND   | 19 400 TND |
| 12   | 150                | 2 000     | 48 000 TND  | 20 000 TND  | 68 000 TND |

## Checklist Lancement

- [ ] Compte Render.com créé
- [ ] Backend déployé sur Render
- [ ] App buildée avec EAS
- [ ] APK testé sur téléphone
- [ ] Compte Google Play créé (25 USD)
- [ ] App soumise sur Google Play
- [ ] Compte Apple Developer créé (99 USD)
- [ ] App soumise sur App Store
- [ ] Booking.com affiliate approuvé
- [ ] Expedia affiliate approuvé
- [ ] 10 hôtels contactés
- [ ] Première réservation trackée ✅
