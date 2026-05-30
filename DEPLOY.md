# Déploiement EASYWAY sur Render

## Prérequis
- Compte Render.com (gratuit sur render.com)
- Code sur GitHub (github.com/tarrouk1980/easyway-app)

---

## Étape 1 — Créer un compte Render
1. Va sur [render.com](https://render.com)
2. Clique **"Get Started for Free"**
3. Connecte avec ton compte GitHub

---

## Étape 2 — Déployer avec Blueprint
1. Dans Render, clique **"New +"** → **"Blueprint"**
2. Connecte ton repo GitHub : `tarrouk1980/easyway-app`
3. Render détecte `render.yaml` automatiquement
4. Clique **"Apply"** — Render crée automatiquement :
   - La base de données PostgreSQL (`easyway-db`)
   - Redis (`easyway-redis`)
   - Le backend API (`easyway-api`)

---

## Étape 3 — Configurer les variables secrètes
Dans **Render Dashboard → easyway-api → Environment** :

| Variable | Comment la remplir |
|---|---|
| `JWT_ACCESS_SECRET` | Générée automatiquement par Render |
| `JWT_REFRESH_SECRET` | Générée automatiquement par Render |
| `FIREBASE_PROJECT_ID` | Depuis la console Firebase (optionnel) |
| `FIREBASE_CLIENT_EMAIL` | Depuis la console Firebase (optionnel) |
| `FIREBASE_PRIVATE_KEY` | Depuis la console Firebase (optionnel) |
| `STRIPE_SECRET_KEY` | Depuis le dashboard Stripe (optionnel) |
| `TWILIO_ACCOUNT_SID` | Depuis le dashboard Twilio (optionnel) |
| `TWILIO_AUTH_TOKEN` | Depuis le dashboard Twilio (optionnel) |
| `TWILIO_PHONE_NUMBER` | Numéro Twilio (optionnel) |

> Les variables `DATABASE_URL` et `REDIS_URL` sont injectées automatiquement par Render — ne pas les modifier.

Pour générer une clé secrète manuellement :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Étape 4 — Lancer les migrations
Render exécute les migrations automatiquement à chaque déploiement via la commande :
```
npx prisma migrate deploy
```

Si tu as besoin de les lancer manuellement :
1. Dans Render → **easyway-api** → **Shell**
2. Exécute :
```bash
npx prisma migrate deploy
```

---

## Étape 5 — Vérifier le déploiement
- **URL API** : `https://easyway-api.onrender.com`
- **Health check** : `https://easyway-api.onrender.com/health`
- Réponse attendue : `{"status":"ok"}`

---

## Étape 6 — Configurer l'app mobile
Dans `mobile/services/api.js`, change la `baseURL` :
```js
baseURL: 'https://easyway-api.onrender.com/api'
```

---

## Notes importantes

| Sujet | Détail |
|---|---|
| Cold start | Plan gratuit : le service "dort" après 15 min d'inactivité. Redémarrage ~30 secondes. |
| Éviter le cold start | Passer au plan **Starter** ($7/mois) |
| PostgreSQL gratuit | Disponible 90 jours, puis **$7/mois** |
| Redis gratuit | Inclus dans le plan gratuit Render |
| Logs | Render Dashboard → easyway-api → **Logs** |
| Redéployer | Push sur la branche `main` → déploiement automatique |
