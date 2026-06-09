# SKOLZ Mobile App

React Native / Expo mobile app for the SKOLZ expert marketplace.

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or the Expo Go app

## Setup

```bash
cd mobile
npm install
```

## Configuration

Edit `lib/api.ts` and update `API_URL` to point to your backend:

```typescript
const API_URL = 'http://YOUR_MACHINE_IP:8000/api';
```

When testing on a physical device, use your machine's local IP address (not `localhost`).

## Running

```bash
# Start the development server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (macOS only)
npx expo start --ios
```

Then scan the QR code with the **Expo Go** app on your phone, or press `a` for Android / `i` for iOS.

## Project Structure

```
mobile/
  app/                    # Expo Router file-based routing
    (tabs)/
      index.tsx           # Home tab
      experts.tsx         # Experts browse tab
      bookings.tsx        # My bookings tab
      profile.tsx         # Profile tab
    experts/[id].tsx      # Expert detail screen
    login.tsx             # Login screen
    register.tsx          # Register screen
    _layout.tsx           # Root layout (React Query provider)
  components/
    ExpertCard.tsx        # Premium expert card component
    BookingCard.tsx       # Booking list card
    StarRating.tsx        # Star rating component
  lib/
    api.ts                # Axios API client + TypeScript interfaces
    auth.ts               # Authentication with SecureStore
  assets/                 # App icons and splash screen
```

## Features

- Premium design with indigo/purple gradient theme
- Browse and search experts by category
- Expert profile with details and booking
- My bookings list with status badges
- User profile with logout
- Secure token storage via expo-secure-store
- React Query for data fetching and caching
