# OPTIMARK — La marketplace tunisienne

## Structure

```
optimark/
├── frontend/   # Next.js 14 + Tailwind CSS + TypeScript
├── backend/    # NestJS + Prisma + PostgreSQL
└── mobile/     # React Native (Expo) — placeholder
```

## Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Lancement Frontend

```bash
cd frontend
npm install
npm run dev
# Accessible sur http://localhost:3000
```

## Lancement Backend

```bash
cd backend
npm install
# Créer la base de données PostgreSQL
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev
# API accessible sur http://localhost:3001
```

## Variables d'environnement

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=OPTIMARK
```

### backend/.env
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/optimark"
JWT_SECRET="optimark-secret-jwt-2025"
PORT=3001
```

## Contact

contact@optimark.tn
