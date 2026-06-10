# Guide de Déploiement EasyHotels

## Table des matières
1. [Déploiement Backend sur Render.com](#1-backend--render)
2. [Configuration de la base de données PostgreSQL](#2-base-de-données-postgresql)
3. [Build et publication de l'app mobile (Expo EAS)](#3-app-mobile--expo-eas)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Programmes d'affiliation](#5-programmes-daffiliation)
6. [Estimation des revenus](#6-estimation-des-revenus)

---

## 1. Backend — Render

### Étape 1 — Créer un compte Render.com
1. Aller sur [https://render.com](https://render.com) → **Get Started for Free**
2. S'inscrire avec GitHub (recommandé pour le déploiement automatique)

### Étape 2 — Créer un service Web
1. Dashboard → **New** → **Web Service**
2. Connecter le dépôt GitHub `Netplay-IPTV`
3. Configurer :
   - **Name** : `easyhotels-api`
   - **Environment** : `Node`
   - **Build Command** : `cd backend && npm install`
   - **Start Command** : `cd backend && npm start`
   - **Plan** : Free (ou Starter pour la production)

### Étape 3 — Configurer les variables d'environnement
Dans **Environment** → **Environment Variables**, ajouter les variables listées [ci-dessous](#4-variables-denvironnement).

### Étape 4 — Vérifier le déploiement
- URL santé : `https://easyhotels-api.onrender.com/health`
- Réponse attendue : `{ "status": "ok", "services": { "db": "ok", "redis": "ok" } }`

---

## 2. Base de données PostgreSQL

### Sur Render (recommandé)
1. Dashboard → **New** → **PostgreSQL**
2. **Name** : `easyhotels-db`
3. **Plan** : Free
4. Copier la **Connection String** → coller dans `DATABASE_URL`

### Migration de la base
```bash
cd backend
npx prisma migrate deploy
```

---

## 3. App Mobile — Expo EAS

### Étape 1 — Créer un compte Expo
1. Aller sur [https://expo.dev](https://expo.dev) → **Sign up**
2. Créer une organisation ou utiliser le compte personnel

### Étape 2 — Installer EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Étape 3 — Configurer EAS Build
```bash
cd mobile
eas build:configure
```

### Étape 4 — Builder l'application
```bash
# Android APK/AAB
eas build --platform android --non-interactive

# iOS (nécessite un compte Apple Developer)
eas build --platform ios --non-interactive

# Les deux
eas build --platform all --non-interactive
```

### Étape 5 — Soumettre sur les stores

#### Google Play Store
```bash
eas submit --platform android
```
Prérequis : compte Google Play Developer (~25 USD one-time)

#### Apple App Store
```bash
eas submit --platform ios
```
Prérequis : compte Apple Developer (~99 USD/an)

### Mises à jour OTA (Over The Air)
```bash
eas update --branch main --message "Fix: mise à jour des prix"
```

---

## 4. Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@host:5432/easyhotels` |
| `JWT_SECRET` | Clé secrète JWT | Générer avec `openssl rand -hex 32` |
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `production` |
| `REDIS_URL` | URL Redis | `redis://localhost:6379` |
| `FIREBASE_PROJECT_ID` | Projet Firebase FCM | `easyhotels-prod` |

### Générer des secrets sécurisés
```bash
# JWT_SECRET
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Programmes d'affiliation

### Booking.com
- **Inscription** : [https://affiliate.booking.com/affiliateadmin/registernewpartner.html](https://affiliate.booking.com/affiliateadmin/registernewpartner.html)
- **Commission** : CPC 0,50 – 2,00 USD par clic
- **Format URL** :
  ```
  https://www.booking.com/searchresults.fr.html?ss=DESTINATION&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&group_adults=2&aid=VOTRE_AID
  ```
- Remplacer `VOTRE_AID` par votre Affiliate ID reçu après validation

### Expedia
- **Inscription** : [https://expediagroup.com/solutions/advertising/travel-ads/](https://expediagroup.com/solutions/advertising/travel-ads/)
- **Commission** : CPC 0,40 – 1,50 USD par clic
- **Format URL** :
  ```
  https://www.expedia.fr/Hotel-Search?destination=DESTINATION&d1=YYYY-MM-DD&d2=YYYY-MM-DD&adults=2&AFFCID=VOTRE_AFFCID
  ```

### Hotels.com
- **Inscription** : [https://fr.hotels.com/affiliates/](https://fr.hotels.com/affiliates/)
- **Commission** : CPC 0,35 – 1,20 USD par clic
- **Format URL** :
  ```
  https://fr.hotels.com/search.do?q-destination=DESTINATION&q-check-in=YYYY-MM-DD&q-check-out=YYYY-MM-DD&q-rooms=1&q-room-0-adults=2&pos=VOTRE_POS
  ```

### Airbnb
- **Inscription** : [https://www.airbnb.fr/associates/joining](https://www.airbnb.fr/associates/joining)
- **Commission** : 4 – 8% sur la réservation
- **Format URL** :
  ```
  https://www.airbnb.fr/s/DESTINATION/homes?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&adults=2&af=VOTRE_AF_ID
  ```

### Configurer vos IDs dans le backend
Fichier : `/backend/src/config/affiliates.js`

Remplacer :
- `REPLACE_WITH_YOUR_AID` → votre Affiliate ID Booking.com
- `REPLACE_WITH_YOUR_AFFCID` → votre AFFCID Expedia
- `REPLACE_YOUR_POS` → votre POS Hotels.com
- `REPLACE_YOUR_AF_ID` → votre AF ID Airbnb

---

## 6. Estimation des revenus

### Hypothèses (mois 1-3, marché MENA)
| Métrique | Valeur estimée |
|---|---|
| Visiteurs uniques/mois | 1 000 – 5 000 |
| CTR moyen (clics affiliation) | 4 – 6% |
| CPC moyen | 0,80 USD |
| **Revenus clics/mois** | **~32 – 240 USD** |

### Hypothèses (mois 4-6, avec SEO + marketing)
| Métrique | Valeur estimée |
|---|---|
| Visiteurs uniques/mois | 10 000 – 30 000 |
| CTR moyen | 5% |
| CPC moyen | 0,90 USD |
| **Revenus clics/mois** | **~450 – 1 350 USD** |

### Optimisation des revenus
- **Tester A/B** les boutons "Voir l'offre" vs "Réserver maintenant"
- **Cibler les mots-clés** : "hôtel Djerba prix", "hôtel Marrakech pas cher"
- **Remarketing** : relancer les utilisateurs ayant consulté un hôtel sans cliquer
- **Notifications push** : alertes prix pour les hôtels en favoris
- **Flash deals** : négocier des offres directes avec les hôtels pour des commissions plus élevées

### Revenus additionnels
- Bannières publicitaires hôtelières : 15 – 50 USD CPM
- Abonnement hôtelier (mise en avant) : 50 – 200 USD/mois
- CPA sur réservations complètes (Airbnb) : 4 – 8% / réservation

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/deploy.yml`) effectue automatiquement :
1. **test-backend** : install + tests sur chaque push
2. **deploy-backend** : déploiement Render sur push vers `main`
3. **build-mobile** : préparation du build EAS

Pour activer le déploiement automatique sur Render :
1. Render Dashboard → Settings → **Deploy Hook**
2. Copier l'URL du hook
3. Ajouter dans les secrets GitHub : `RENDER_DEPLOY_HOOK_URL`
4. Remplacer `echo "Trigger Render deploy hook here"` par :
   ```yaml
   run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
   ```
