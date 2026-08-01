/**
 * React Context for managing the Sarvam AI API key state across the app.
 *
 * On mount, loads the key from encrypted storage. Provides `setApiKey`
 * and `clearApiKey` functions that update both the in-memory state
 * and the persisted encrypted storage.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  saveApiKey as storageSave,
  getApiKey as storageGet,
  clearApiKey as storageClear,
} from '../storage/SecureStorage';

interface ApiKeyContextValue {
  /** The current API key, or null if not set. */
  apiKey: string | null;
  /** Whether the key is still being loaded from storage. */
  isLoading: boolean;
  /** Save a new API key (persists to encrypted storage). */
  setApiKey: (key: string) => Promise<void>;
  /** Remove the stored API key. */
  clearApiKey: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  apiKey: null,
  isLoading: true,
  setApiKey: async () => {},
  clearApiKey: async () => {},
});

export function ApiKeyProvider({children}: {children: ReactNode}) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the key from encrypted storage on app start
  useEffect(() => {
    storageGet()
      .then(key => {
        setApiKeyState(key);
      })
      .catch(() => {
        // If storage read fails, start with no key
        setApiKeyState(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setApiKey = useCallback(async (key: string) => {
    await storageSave(key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(async () => {
    await storageClear();
    setApiKeyState(null);
  }, []);

  return (
    <ApiKeyContext.Provider value={{apiKey, isLoading, setApiKey, clearApiKey}}>
      {children}
    </ApiKeyContext.Provider>
  );
}

/**
 * Hook to access the API key context.
 * Must be used within an ApiKeyProvider.
 */
export function useApiKey(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
