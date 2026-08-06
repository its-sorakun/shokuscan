/**
 * ResultScreen — displays the nutritional analysis results.
 *
 * Shows the product name, brand, and the full AI-generated analysis text
 * in a scrollable card. Handles both cached and fresh results.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../navigation/AppNavigator';

type ResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

export default function ResultScreen({navigation, route}: Props) {
  const {barcode, productName, brand, analysis, fromCache} = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Product Header */}
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productBrand}>{brand}</Text>
          <View style={styles.barcodeTag}>
            <Text style={styles.barcodeText}>
              {barcode === 'photo-scan' ? '📸 Photo Analysis' : `📊 ${barcode}`}
            </Text>
            {fromCache && (
              <View style={styles.cacheBadge}>
                <Text style={styles.cacheBadgeText}>⚡ Cached</Text>
              </View>
            )}
          </View>
        </View>

        {/* Analysis Card */}
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Nutritional Analysis</Text>
          <View style={styles.divider} />
          <Text style={styles.analysisText}>{analysis}</Text>
        </View>
      </ScrollView>

      {/* Scan Another Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.scanAgainText}>📸 Scan Another</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  productBrand: {
    fontSize: 15,
    color: '#888888',
    marginTop: 4,
  },
  barcodeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
  },
  barcodeText: {
    color: '#666666',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  cacheBadge: {
    backgroundColor: '#1a3a1a',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  cacheBadgeText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#0f0f0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  scanAgainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
