/**
 * HomeScreen — the main scanner screen.
 *
 * Displays a camera viewfinder for barcode scanning. On detection:
 * 1. Debounces the event to prevent duplicate API calls.
 * 2. Checks the LRU cache for a previous result.
 * 3. On cache miss, fetches product data from OpenFoodFacts.
 * 4. If the user has an API key, sends the data to Sarvam AI.
 * 5. Navigates to the ResultScreen with the analysis.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useApiKey } from '../context/ApiKeyContext';
import {
  fetchProductData,
  serializeProductInfo,
} from '../services/OpenFoodFactsService';
import { analyzeWithSarvam, analyzePhoto } from '../services/SarvamService';
import { buildPrompt } from '../utils/promptBuilder';
import { createBarcodeDebouncer } from '../utils/debounce';
import { LRUCache } from '../utils/LRUCache';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

// Singleton LRU cache shared across re-renders (capacity: 50 barcodes)
const resultCache = new LRUCache<{
  productName: string;
  brand: string;
  analysis: string;
}>(50);

export default function HomeScreen({ navigation }: Props) {
  const { apiKey } = useApiKey();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'photo'>('barcode');
  const [statusText, setStatusText] = useState('Ready to scan');
  const debouncerRef = useRef(createBarcodeDebouncer(3000));
  const cameraRef = useRef<any>(null);

  // Reset debouncer when coming back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      debouncerRef.current.reset();
      setIsProcessing(false);
      setStatusText('Ready to scan');
    });
    return unsubscribe;
  }, [navigation]);

  const handleBarcodeScan = useCallback(
    async (event: { nativeEvent: { codeStringValue: string } }) => {
      const barcode = event.nativeEvent.codeStringValue;
      if (!barcode || isProcessing) {
        return;
      }

      // Debounce: skip if same barcode was just detected
      if (!debouncerRef.current.shouldProcess(barcode)) {
        return;
      }

      setIsProcessing(true);
      setIsScanning(false); // Turn off camera immediately

      // Check LRU cache first — O(1)
      const cached = resultCache.get(barcode);
      if (cached) {
        setStatusText('Found in cache!');
        setIsScanning(false);
        navigation.navigate('Result', {
          barcode,
          productName: cached.productName,
          brand: cached.brand,
          analysis: cached.analysis,
          fromCache: true,
        });
        return;
      }

      // Cache miss — fetch from OpenFoodFacts
      setStatusText('Fetching product data...');
      const productResult = await fetchProductData(barcode);

      if (productResult.error || !productResult.data) {
        setIsProcessing(false);
        setStatusText('Ready to scan');
        Alert.alert(
          'Product Not Found',
          productResult.error ?? 'Could not fetch product data.',
          [{ text: 'OK' }],
        );
        return;
      }

      const productData = productResult.data;
      const serialized = serializeProductInfo(productData);

      // If no API key, navigate with raw data only
      if (!apiKey) {
        const noKeyResult = {
          productName: productData.product_name,
          brand: productData.brand,
          analysis:
            'AI analysis is not available. Please add your Sarvam AI API key in Settings to enable nutritional analysis.\n\n--- Raw Product Data ---\n' +
            serialized,
        };
        resultCache.set(barcode, noKeyResult);
        setIsScanning(false);
        navigation.navigate('Result', {
          barcode,
          ...noKeyResult,
          fromCache: false,
        });
        return;
      }

      // Send to Sarvam AI for analysis
      setStatusText('Analyzing with AI...');
      const prompt = buildPrompt(serialized);
      const sarvamResult = await analyzeWithSarvam(prompt, apiKey);

      const analysisText =
        sarvamResult.analysis ??
        `AI Analysis Error: ${sarvamResult.error}\n\n--- Raw Product Data ---\n${serialized}`;

      const cacheEntry = {
        productName: productData.product_name,
        brand: productData.brand,
        analysis: analysisText,
      };

      // Store in LRU cache
      resultCache.set(barcode, cacheEntry);

      navigation.navigate('Result', {
        barcode,
        ...cacheEntry,
        fromCache: false,
      });
    },
    [apiKey, isProcessing, navigation],
  );

  const toggleScanner = () => {
    if (isProcessing) {
      return;
    }
    setIsScanning(prev => !prev);
    setStatusText(isScanning ? 'Ready' : scanMode === 'barcode' ? 'Align barcode with camera' : 'Take a photo of ingredients');
    debouncerRef.current.reset();
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your Sarvam AI API key in Settings to use Photo Analysis.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsProcessing(true);
    setStatusText('Capturing photo...');
    try {
      const captureData = await cameraRef.current.capture();
      setIsScanning(false); // Turn off camera immediately
      setStatusText('Analyzing with AI... (this may take up to 60s)');
      
      const sarvamResult = await analyzePhoto(captureData.uri, apiKey);
      const analysisText = sarvamResult.analysis ?? `AI Analysis Error: ${sarvamResult.error}`;
      
      navigation.navigate('Result', {
        barcode: 'photo-scan',
        productName: 'Custom Scan',
        brand: 'From Photo',
        analysis: analysisText,
        fromCache: false,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to capture or analyze photo');
    } finally {
      setIsProcessing(false);
      setStatusText('Ready');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ShokuScan</Text>
        <Text style={styles.subtitle}>Nutritional Intelligence</Text>
      </View>

      {/* API Key Banner */}
      {!apiKey && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}>
          <Text style={styles.bannerIcon}>🔑</Text>
          <Text style={styles.bannerText}>
            Add your Sarvam AI key in Settings to enable AI analysis
          </Text>
        </TouchableOpacity>
      )}

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'barcode' && styles.modeButtonActive]}
          onPress={() => setScanMode('barcode')}
          disabled={isProcessing || isScanning}>
          <Text style={styles.modeText}>Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'photo' && styles.modeButtonActive]}
          onPress={() => setScanMode('photo')}
          disabled={isProcessing || isScanning}>
          <Text style={styles.modeText}>Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Camera / Scanner Area */}
      <View style={styles.scannerContainer}>
        {isScanning ? (
          <View style={styles.cameraWrapper}>
            <Camera
              ref={cameraRef}
              scanBarcode={scanMode === 'barcode'}
              onReadCode={scanMode === 'barcode' ? handleBarcodeScan : undefined}
              showFrame={scanMode === 'barcode'}
              laserColor="#4CAF50"
              frameColor="#4CAF50"
              shutterPhotoSound={false}
              style={styles.camera}
            />
            {scanMode === 'photo' && (
              <TouchableOpacity
                style={styles.captureButtonOverlay}
                onPress={handleCapturePhoto}
                disabled={isProcessing}>
                <View style={styles.captureInnerCircle} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.scannerPlaceholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>
              {isProcessing ? 'Processing...' : 'Tap below to start scanning'}
            </Text>
          </View>
        )}
      </View>

      {/* Status */}
      <Text style={styles.status}>{statusText}</Text>

      {/* Loading Indicator */}
      {isProcessing && (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={styles.loader}
        />
      )}

      {/* Scan Button */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          isScanning && styles.scanButtonActive,
          isProcessing && styles.scanButtonProcessing,
        ]}
        onPress={toggleScanner}
        disabled={isProcessing}
        activeOpacity={0.8}>
        <Text style={styles.scanButtonText}>
          {isProcessing
            ? '⏳ Processing...'
            : isScanning
              ? '✕ Stop Camera'
              : scanMode === 'barcode'
                ? '📸 Scan Barcode'
                : '📸 Open Camera'}
        </Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}>
        <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  bannerIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  bannerText: {
    color: '#aaaacc',
    fontSize: 13,
    flex: 1,
  },
  scannerContainer: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#666666',
    fontSize: 15,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 16,
    padding: 4,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  captureButtonOverlay: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
  },
  status: {
    marginTop: 16,
    color: '#888888',
    fontSize: 14,
  },
  loader: {
    marginTop: 12,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 28,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonActive: {
    backgroundColor: '#f44336',
    shadowColor: '#f44336',
  },
  scanButtonProcessing: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  settingsButtonText: {
    color: '#666666',
    fontSize: 14,
  },
});
