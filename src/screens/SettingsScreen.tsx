/**
 * SettingsScreen — API key management (BYOK).
 *
 * Allows users to input, save, and clear their Sarvam AI API key.
 * The key is stored in Android's EncryptedSharedPreferences.
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import {useApiKey} from '../context/ApiKeyContext';

export default function SettingsScreen() {
  const {apiKey, setApiKey, clearApiKey} = useApiKey();
  const [inputValue, setInputValue] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate the field if a key already exists
  useEffect(() => {
    if (apiKey) {
      setInputValue(apiKey);
    }
  }, [apiKey]);

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      Alert.alert('Invalid Key', 'Please enter a valid API key.');
      return;
    }

    setIsSaving(true);
    try {
      await setApiKey(trimmed);
      Alert.alert('Saved', 'Your Sarvam AI API key has been saved securely.');
    } catch {
      Alert.alert('Error', 'Failed to save the API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your stored API key?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearApiKey();
            setInputValue('');
            Alert.alert('Cleared', 'Your API key has been removed.');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Status Indicator */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              apiKey ? styles.statusDotActive : styles.statusDotInactive,
            ]}
          />
          <Text style={styles.statusText}>
            {apiKey ? 'API Key Configured' : 'No API Key Set'}
          </Text>
        </View>

        {/* API Key Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sarvam AI API Key</Text>
          <Text style={styles.sectionDescription}>
            Enter your Sarvam AI API key to enable AI-powered nutritional
            analysis. Your key is stored securely on this device using encrypted
            storage and is never sent to any server other than Sarvam AI.
          </Text>

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your API key..."
              placeholderTextColor="#555555"
              value={inputValue}
              onChangeText={setInputValue}
              secureTextEntry={!isKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            />
            <TouchableOpacity
              style={styles.toggleVisibility}
              onPress={() => setIsKeyVisible(prev => !prev)}
              activeOpacity={0.7}>
              <Text style={styles.toggleVisibilityText}>
                {isKeyVisible ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : '💾 Save API Key'}
            </Text>
          </TouchableOpacity>

          {apiKey && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.8}>
              <Text style={styles.clearButtonText}>🗑️ Clear API Key</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to get an API key</Text>
          <Text style={styles.infoText}>
            1. Visit dashboard.sarvam.ai and create an account.{'\n'}
            2. Navigate to the API Keys section.{'\n'}
            3. Generate a new key and paste it above.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusDotInactive: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#cccccc',
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'monospace',
  },
  toggleVisibility: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleVisibilityText: {
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#2a5a2a',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 15,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#aaaacc',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8888aa',
    lineHeight: 22,
  },
});
