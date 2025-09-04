import { FavoritePokemon, SyncAction } from '@/types/pokemon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITES: '@pokemon_favorites',
  SYNC_QUEUE: '@pokemon_sync_queue',
  POKEMON_CACHE: '@pokemon_cache'
};

export const storageService = {
  async getFavorites(): Promise<FavoritePokemon[]> {
    try {
      const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.log('Error getting favorites from storage:', error);
      return [];
    }
  },

  async saveFavorites(favorites: FavoritePokemon[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.log('Error saving favorites to storage:', error);
    }
  },

  async getSyncQueue(): Promise<SyncAction[]> {
    try {
      const queue = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.log('Error getting sync queue from storage:', error);
      return [];
    }
  },

  async saveSyncQueue(queue: SyncAction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.log('Error saving sync queue to storage:', error);
    }
  },

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.SYNC_QUEUE);
    } catch (error) {
      console.log('Error clearing sync queue:', error);
    }
  },

  async cachePokemonData(key: string, data: any): Promise<void> {
    try {
      const cacheKey = `${KEYS.POKEMON_CACHE}_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.log('Error caching Pokemon data:', error);
    }
  },

  async getCachedPokemonData(key: string): Promise<any> {
    try {
      const cacheKey = `${KEYS.POKEMON_CACHE}_${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes
        
        if (!isExpired) {
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.log('Error getting cached Pokemon data:', error);
      return null;
    }
  }
};