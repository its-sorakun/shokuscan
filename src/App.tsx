/**
 * ShokuScan Mobile App — Root Component
 *
 * Wraps the entire app with the ApiKeyProvider (for BYOK state management)
 * and the navigation stack.
 */
import React from 'react';
import {ApiKeyProvider} from './context/ApiKeyContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <ApiKeyProvider>
      <AppNavigator />
    </ApiKeyProvider>
  );
}
