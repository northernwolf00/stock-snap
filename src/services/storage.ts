import * as SecureStore from 'expo-secure-store';

const PREFIX = 'stocksnap_';

export async function secureGet(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(PREFIX + key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  return SecureStore.setItemAsync(PREFIX + key, value);
}

export async function secureDelete(key: string): Promise<void> {
  return SecureStore.deleteItemAsync(PREFIX + key);
}

export async function getAuthToken(): Promise<string | null> {
  return secureGet('auth_token');
}

export async function setAuthToken(token: string): Promise<void> {
  return secureSet('auth_token', token);
}

export async function clearAuthToken(): Promise<void> {
  return secureDelete('auth_token');
}
