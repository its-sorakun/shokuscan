/**
 * Secure storage wrapper for API keys using react-native-encrypted-storage.
 *
 * Encrypted storage uses Android's EncryptedSharedPreferences under the hood,
 * which encrypts both keys and values using AES-256 with a master key
 * stored in Android Keystore.
 */
import EncryptedStorage from 'react-native-encrypted-storage';

const SARVAM_API_KEY_STORAGE_KEY = 'sarvam_api_key';

/**
 * Persist the Sarvam AI API key to encrypted device storage.
 * @throws if storage write fails
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await EncryptedStorage.setItem(SARVAM_API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Retrieve the stored Sarvam AI API key.
 * @returns The API key string, or null if none has been saved.
 */
export async function getApiKey(): Promise<string | null> {
  const key = await EncryptedStorage.getItem(SARVAM_API_KEY_STORAGE_KEY);
  return key ?? null;
}

/**
 * Remove the stored Sarvam AI API key from device storage.
 */
export async function clearApiKey(): Promise<void> {
  await EncryptedStorage.removeItem(SARVAM_API_KEY_STORAGE_KEY);
}

/**
 * Check whether an API key is currently stored.
 */
export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}
