# EASYWAY — Phase 1: Socle Commun

Multi-service mobility platform for Tunisia. Phase 1 implements the common foundation: authentication, subscriptions (pass-jour), real-time geolocation, push notifications, and the React Native mobile app.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Expo CLI (`npm install -g expo-cli`)

## Quickstart (Docker)

```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# 2. Start all services
docker-compose up -d

# 3. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 4. Backend is available at http://localhost:3000
```

## Manual Setup (Development)

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — minimum required:
# DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# 4. Run migrations
npm run db:migrate

# 5. Start backend
npm run dev

# 6. Install mobile dependencies
cd ../mobile
npm install

# 7. Start Expo
npm start
```

## Run Tests

```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login with phone/password |
| POST | /api/auth/refresh | — | Rotate access+refresh tokens |
| POST | /api/auth/logout | Bearer | Revoke refresh token |
| POST | /api/auth/otp/send | — | Send OTP to phone |
| POST | /api/auth/otp/verify | — | Verify OTP code |
| GET | /api/users/me | Bearer | Get own profile |
| PATCH | /api/users/me | Bearer | Update profile |
| POST | /api/users/me/kyc | Bearer (CHAUFFEUR/DEPANNEUR) | Submit KYC documents |
| GET | /api/subscriptions/my | Bearer (provider) | Get active subscription |
| POST | /api/subscriptions/purchase | Bearer (provider) | Buy a pass |
| POST | /api/subscriptions/consume | Bearer (provider) | Consume a ride (atomic) |
| POST | /api/notifications/send | Bearer (ADMIN) | Send push notifications |
| POST | /api/notifications/register-token | Bearer | Register FCM token |
| POST | /api/geo/update | Bearer (provider) | Update geo position |
| GET | /api/geo/nearby | Bearer | Find nearby providers |
| GET | /health | — | Health check |

## Subscription Plans

| Plan | Rides | Duration | Price |
|------|-------|----------|-------|
| DECOUVERTE | 1 | 7 days | 9.9 TND |
| SEMAINE | 7 | 14 days | 59 TND |
| MENSUEL | 30 | 45 days | 199 TND |
| PRO | Unlimited | 30 days | 499 TND |

## Project Structure

```
├── backend/
│   ├── prisma/schema.prisma      # Database schema
│   ├── src/
│   │   ├── config/               # env, db, redis singletons
│   │   ├── middleware/           # auth, rbac, kycGuard
│   │   ├── routes/               # auth, users, subscriptions, notifications, geo
│   │   ├── services/             # tokenService, fcm, payment, geolocation
│   │   ├── socket/               # Socket.io + Redis Pub/Sub
│   │   ├── app.js                # Express app
│   │   └── server.js             # HTTP server entry
│   ├── tests/                    # Jest tests
│   ├── Dockerfile
│   └── .env.example
├── mobile/
│   ├── App.js                    # Root navigator
│   ├── screens/                  # auth/, home/, profile/, notifications/
│   ├── components/               # ServiceCard, PassStatusCard, NotificationBadge
│   ├── store/                    # Zustand stores (auth, pass, location, notification)
│   └── services/                 # api.js (axios), socket.js (socket.io-client)
└── docker-compose.yml
```

## WebSocket Events

Connect with `auth: { token: accessToken }`.

| Event (client → server) | Description |
|-------------------------|-------------|
| `join:service` | Join a service room (TAXI/SOS/DELIVERY/GROCERY) |
| `leave:service` | Leave a service room |

| Event (server → client) | Description |
|-------------------------|-------------|
| `location:update` | Provider location update `{ userId, lat, lng, serviceType }` |
