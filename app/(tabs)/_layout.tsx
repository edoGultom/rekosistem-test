import { cleanupNetworkListener, initializeNetworkListener, usePokemonStore } from '@/store/pokemonStore';
import { Tabs } from 'expo-router';
import { Heart, Home, Settings } from 'lucide-react-native';
import React, { useEffect } from 'react';

export default function TabLayout() {
  const { loadOfflineData } = usePokemonStore();

  useEffect(() => {
    // Initialize the app
    initializeNetworkListener();
    loadOfflineData();

    return () => {
      cleanupNetworkListener();
    };
  }, [loadOfflineData]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokémon',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}