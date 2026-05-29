import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

let socket = null;

export async function connectSocket() {
  if (socket?.connected) return socket;

  const accessToken = await AsyncStorage.getItem('accessToken');
  if (!accessToken) {
    console.warn('[Socket] No access token — cannot connect');
    return null;
  }

  socket = io(WS_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  // Handle token refresh: reconnect with new token
  socket.on('reconnect_attempt', async () => {
    const newToken = await AsyncStorage.getItem('accessToken');
    if (newToken) {
      socket.auth = { token: newToken };
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinServiceRoom(serviceType) {
  if (socket?.connected) {
    socket.emit('join:service', serviceType);
  }
}

export function onLocationUpdate(callback) {
  if (socket) {
    socket.on('location:update', callback);
    // Return cleanup function
    return () => socket?.off('location:update', callback);
  }
  return () => {};
}

export function getSocket() {
  return socket;
}
