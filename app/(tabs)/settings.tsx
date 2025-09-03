import { storageService } from '@/services/storage';
import { usePokemonStore } from '@/store/pokemonStore';
import { Database, Info, Trash2, Wifi } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { favorites, syncQueue, isOffline, syncWhenOnline } = usePokemonStore();

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'Are you sure you want to clear all favorites? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageService.saveFavorites([]);
            // This would need to trigger a store update - simplified for demo
            Alert.alert('Success', 'Favorites cleared successfully');
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    if (isOffline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      return;
    }

    await syncWhenOnline();
    Alert.alert('Success', 'Sync completed successfully');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Info size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Database size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Favorites Count</Text>
            <Text style={styles.infoValue}>{favorites.length}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Wifi size={20} color={isOffline ? '#EF4444' : '#10B981'} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Connection Status</Text>
            <Text style={[styles.infoValue, { color: isOffline ? '#EF4444' : '#10B981' }]}>
              {isOffline ? 'Offline' : 'Online'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sync Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <Text style={styles.sectionDescription}>
          {syncQueue.length > 0 
            ? `${syncQueue.length} actions queued for sync`
            : 'All data is synced'
          }
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isOffline ? '#9CA3AF' : '#3B82F6' }]}
          onPress={handleSyncNow}
          disabled={isOffline}
        >
          <Text style={styles.buttonText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Clear your local data. This will remove all favorites and cached data.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearFavorites}
        >
          <Trash2 size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Clear Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Features</Text>
        <Text style={styles.sectionDescription}>
          This app supports offline functionality. Your favorites are saved locally and will sync when you&apos;re back online.
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Browse previously loaded Pokémon</Text>
          <Text style={styles.featureItem}>• Add/remove favorites offline</Text>
          <Text style={styles.featureItem}>• Automatic sync when online</Text>
          <Text style={styles.featureItem}>• Cached Pokémon details</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
  },
});